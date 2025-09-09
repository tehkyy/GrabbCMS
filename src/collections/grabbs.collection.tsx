import {
    buildCollection,
    buildProperty,
    EntityCallbacks,
    EntityOnSaveProps
} from "firecms";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { dbConfig } from "../utils/firebase.utils";

const firebaseApp = initializeApp(dbConfig);
const db = getFirestore(firebaseApp);

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
}

export const grabbsCollection = buildCollection({
    name: "Grabbs",
    path: "grabb_q",
    singularName: "Grabb",
    icon: "Sell",
    properties: {
        slug: buildProperty({
            name: "Slug",
            dataType: "string",
            readOnly: true,
            hideFromCollection: true,
            description: "Automatically generated slug"
        }),
        product: {
            dataType: "reference",
            name: "Queued Product",
            description: "Reference to a product",
            path: "products",
            previewProperties: ["main_image", "name"]
        },
        createdAt: {
            name: "Created",
            dataType: "date",
            autoValue: "on_create",
            hideFromCollection: true
        },
        quantity: {
            dataType: "number",
            name: "Starting Quantity",
            readOnly: true,
            columnWidth: 200
        },
        stripe_id: {
            dataType: "string",
            name: "Stripe ID",
            readOnly: true,
            columnWidth: 200
        }
    },
    textSearchEnabled: true,

    callbacks: {
        onPreSave: async ({ values }: EntityOnSaveProps<any>) => {
            if (!values.product?.path) {
                throw new Error("Queued product must reference a valid product");
            }

            const prodRefPath = `${values.product.path}/${values.product.id}`;
            const [collection, docId] = prodRefPath.split("/").filter(Boolean);

            const snap = await getDoc(doc(db, collection, docId));

            if (!snap.exists()) {
                throw new Error(`No product found at ${collection}/${docId}`);
            }

            const productName = snap.get("name") ?? values.product.id;
            const prodQuantity = snap.get("quantity");
            const stripeID = snap.get("stripe_id");

            if (!stripeID) {
                throw new Error(
                    `Product "${productName}" has no Stripe ID — cannot queue Grabb.`
                );
            }

            values.slug = slugify(`${productName}-${Date.now()}`);
            if (prodQuantity !== undefined) values.quantity = prodQuantity;
            values.stripe_id = stripeID;

            return values; // ✅ Only saved if valid
        }
    } as EntityCallbacks<any>
});
