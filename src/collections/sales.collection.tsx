import {
    buildCollection,
    buildProperty,
    EntityCallbacks,
    EntityOnSaveProps
} from "firecms";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { dbConfig } from "../utils/firebase.utils";

const transactionProperty = buildProperty({
    dataType: "map",
    name: "Transaction",
    readOnly: true,
    properties: {
        grabbId: buildProperty({
            dataType: "string",
            name: "Grabb ID",
            readOnly: true,
        }),
        type: buildProperty({
            dataType: "string",
            name: "Type",
            readOnly: true,
            enumValues: {
                user: { id: "user", label: "User", color: "blueDark" },
                floor: { id: "floor", label: "Floor", color: "purpleDark" },
            }
        }),
        price: buildProperty({
            dataType: "string",
            name: "Price (¢)",
            readOnly: true,
        }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            readOnly: true,
            enumValues: {
                reserved: { id: "reserved", label: "Reserved", color: "orangeLight" },
                paid: { id: "paid", label: "Paid", color: "greenDark" },
                abandoned: { id: "abandoned", label: "Abandoned", color: "redLight" },
                auto: { id: "auto", label: "Auto", color: "grayLight" },
            }
        }),
        userId: buildProperty({
            dataType: "string",
            name: "User ID",
            readOnly: true,
        }),
        stripeSessionId: buildProperty({
            dataType: "string",
            name: "Stripe Session ID",
            readOnly: true,
        }),
        timestamp: buildProperty({
            dataType: "string",
            name: "Timestamp",
            readOnly: true,
        }),
    }
});

export const salesCollection = buildCollection({
    name: "Sales",
    path: "sales",
    singularName: "Sale",
    icon: "PointOfSale",
    defaultSize: "m",
    initialSort: ["startedAt", "desc"],
    properties: {
        productId: buildProperty({
            dataType: "string",
            name: "Product ID",
            readOnly: true,
            columnWidth: 220,
        }),
        slug: buildProperty({
            dataType: "string",
            name: "Slug",
            readOnly: true,
            columnWidth: 180,
            hideFromCollection: true,
        }),
        startedAt: buildProperty({
            dataType: "date",
            name: "Started",
            readOnly: true,
            columnWidth: 180,
            mode: "date_time",
        }),
        endedAt: buildProperty({
            dataType: "date",
            name: "Ended",
            readOnly: true,
            columnWidth: 180,
            mode: "date_time",
        }),
        endReason: buildProperty({
            dataType: "string",
            name: "End Reason",
            readOnly: true,
            columnWidth: 130,
            enumValues: {
                sold_out: { id: "sold_out", label: "Sold Out", color: "greenDark" },
                manual_stop: { id: "manual_stop", label: "Manual Stop", color: "redDark" },
                NONE: { id: "NONE", label: "Active", color: "blueDark" },
            }
        }),
        startingPrice: buildProperty({
            dataType: "number",
            name: "Start Price (¢)",
            readOnly: true,
            columnWidth: 130,
        }),
        floorPrice: buildProperty({
            dataType: "number",
            name: "Floor Price (¢)",
            readOnly: true,
            columnWidth: 130,
        }),
        grabbCount: buildProperty({
            dataType: "number",
            name: "Grabbs",
            readOnly: true,
            columnWidth: 90,
        }),
        paidCount: buildProperty({
            dataType: "number",
            name: "Paid",
            readOnly: true,
            columnWidth: 90,
        }),
        quantityStart: buildProperty({
            dataType: "number",
            name: "Qty Start",
            readOnly: true,
            columnWidth: 100,
        }),
        quantityRemaining: buildProperty({
            dataType: "number",
            name: "Qty Remaining",
            readOnly: true,
            columnWidth: 130,
        }),
        stripeId: buildProperty({
            dataType: "string",
            name: "Stripe Product ID",
            readOnly: true,
            hideFromCollection: true,
        }),
        transactions: buildProperty({
            dataType: "map",
            name: "Transactions",
            readOnly: true,
            hideFromCollection: true,
            keyValue: true,
        }),
    },
});