import { buildCollection, buildProperty, EntityCallbacks, EntityOnSaveProps } from "firecms";
import { doc, getDoc, getFirestore, runTransaction, increment } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { dbConfig } from "../utils/firebase.utils";
import { QuantityStepperField } from "../fields/QuantityStepperField";
import { Grabb } from "../types/grabb-q.type";

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(dbConfig);
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

export const grabbsCollection = buildCollection<Grabb>({
  name: "Grabbs",
  path: "grabb_q",
  singularName: "Grabb",
  icon: "Sell",
  initialSort: ["createdAt", "asc"],
  properties: {
    isActive: {
      name: "Active",
      dataType: "boolean",
      readOnly: true,
      columnWidth: 80,
    },
    product: {
      dataType: "reference",
      name: "Queued Product",
      description: "Reference to a product",
      path: "products",
      previewProperties: ["main_image", "name"],
      forceFilter: {
        quantity: [">=", 1],
      }
    },
    quantity: buildProperty({
      name: "Quantity Queued",
      dataType: "number",
      description: "How many units to sell in this grabb session.",
      Field: QuantityStepperField,
      validation: {
        required: true,
        min: 1,
      },
      columnWidth: 200,
    }),
    originType: buildProperty({
      name: "Origin",
      dataType: "string",
      readOnly: true,
      hideFromCollection: false,
      description: "How this queue entry was created"
    }),
    createdAt: {
      name: "Created",
      dataType: "date",
      autoValue: "on_create",
      hideFromCollection: true
    },
    stripe_id: {
      dataType: "string",
      name: "Stripe ID",
      readOnly: true,
      hideFromCollection: true,
      description: "The Stripe product ID for the queued product",
      columnWidth: 200
    },
    slug: buildProperty({
      name: "Slug",
      dataType: "string",
      readOnly: true,
      hideFromCollection: true,
      description: "Automatically generated slug"
    }),

  },
  callbacks: {
    onPreSave: async ({ values }: EntityOnSaveProps<any>) => {
      if (!values.product?.path) {
        throw new Error("Queued product must reference a valid product");
      }

      const requestedQuantity = values.quantity;

      if (!requestedQuantity || requestedQuantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      const prodRefPath = `${values.product.path}/${values.product.id}`;
      const [collection, docId] = prodRefPath.split("/").filter(Boolean);
      const productRef = doc(db, collection, docId);
      const snap = await getDoc(productRef);

      if (!snap.exists()) {
        throw new Error(`No product found at ${collection}/${docId}`);
      }

      const productName = snap.get("name") ?? values.product.id;
      const totalQuantity: number = snap.get("quantity") ?? 0;
      const quantityQueued: number = snap.get("quantityQueued") ?? 0;
      const quantityAvailable = totalQuantity - quantityQueued;
      const stripeID = snap.get("stripe_id");

      if (!stripeID) {
        throw new Error(
          `Product "${productName}" has no Stripe ID — cannot queue Grabb.`
        );
      }

      if (quantityAvailable < 1) {
        throw new Error(
          `Product "${productName}" has no available inventory — ` +
          `${totalQuantity} total, ${quantityQueued} already queued.`
        );
      }

      if (requestedQuantity > quantityAvailable) {
        throw new Error(
          `Cannot queue ${requestedQuantity} units of "${productName}" — ` +
          `only ${quantityAvailable} available (${totalQuantity} total, ${quantityQueued} already queued).`
        );
      }

      values.slug = slugify(`${productName}-${Date.now()}`);
      values.stripe_id = stripeID;
      values.originType = 'manual';

      // Atomically mark those units as queued on the product doc
      await runTransaction(db, async (tx) => {
        const freshSnap = await tx.get(productRef);
        const freshTotal = freshSnap.get("quantity") ?? 0;
        const freshQueued = freshSnap.get("quantityQueued") ?? 0;
        const freshAvailable = freshTotal - freshQueued;

        if (requestedQuantity > freshAvailable) {
          throw new Error(
            `Race condition: only ${freshAvailable} units available for "${productName}". Please try again.`
          );
        }

        tx.update(productRef, {
          quantityQueued: increment(requestedQuantity)
        });
      });

      return values;
    },
    onDelete: async ({ entity }: { entity: any }) => {
      const productRef = entity.values?.product;
      const quantity = entity.values?.quantity ?? 0;

      if (!productRef?.id || !productRef?.path || quantity < 1) return;

      const [collection, docId] = `${productRef.path}/${productRef.id}`.split("/").filter(Boolean);

      try {
        await runTransaction(db, async (tx) => {
          const productDocRef = doc(db, collection, docId);
          const snap = await tx.get(productDocRef);
          if (!snap.exists()) return;

          const currentQueued = snap.get("quantityQueued") ?? 0;
          const newQueued = Math.max(0, currentQueued - quantity);
          tx.update(productDocRef, { quantityQueued: newQueued });
        });
        console.log(`[Queue] Deleted queue entry — released ${quantity} units for ${docId}`);
      } catch (err) {
        console.error("[Queue] Error releasing quantityQueued on delete:", err);
      }
    }
  } as EntityCallbacks<any>
});
