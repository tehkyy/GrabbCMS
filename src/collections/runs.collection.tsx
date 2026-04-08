// ─── runs.collection.tsx ──────────────────────────────────────────────────────
// Subcollection of products — exposes products/{productId}/runs/{runId}
// Read-only in the CMS since runs are written by the dropserver.
// ─────────────────────────────────────────────────────────────────────────────

import { buildCollection } from "firecms";

export const runsCollection = buildCollection({
  name: "Runs",
  singularName: "Run",
  path: "runs",
  icon: "Timeline",
  permissions: () => ({
    read: true,
    edit: false,
    create: false,
    delete: false,
  }),
  properties: {
    originType: {
      name: "Origin",
      dataType: "string",
      enumValues: {
        manual: "Manual",
        floor_requeue: "Floor Re-queue",
        abandonment_requeue: "Abandonment Re-queue",
      },
      columnWidth: 160,
    },
    startedAt: {
      name: "Started",
      dataType: "date",
      columnWidth: 180,
    },
    endedAt: {
      name: "Ended",
      dataType: "date",
      columnWidth: 180,
    },
    endReason: {
      name: "End Reason",
      dataType: "string",
      enumValues: {
        sold_out: "Sold Out",
        manual_stop: "Manual Stop",
      },
      columnWidth: 140,
    },
    startingPrice: {
      name: "Starting Price",
      dataType: "number",
      columnWidth: 130,
    },
    floorPrice: {
      name: "Floor Price",
      dataType: "number",
      columnWidth: 120,
    },
    quantityStart: {
      name: "Qty Start",
      dataType: "number",
      columnWidth: 100,
    },
    quantityRemaining: {
      name: "Qty Remaining",
      dataType: "number",
      columnWidth: 120,
    },
    paidCount: {
      name: "Paid",
      dataType: "number",
      columnWidth: 80,
    },
    floorHitCount: {
      name: "Floor Hits",
      dataType: "number",
      columnWidth: 100,
    },
    abandonmentCount: {
      name: "Abandonments",
      dataType: "number",
      columnWidth: 130,
    },
    previousRunId: {
      name: "Previous Run",
      dataType: "string",
      hideFromCollection: true,
    },
    nextRunId: {
      name: "Next Run",
      dataType: "string",
      hideFromCollection: true,
    },
    queueEntryId: {
      name: "Queue Entry",
      dataType: "string",
      hideFromCollection: true,
    },
    slug: {
      name: "Slug",
      dataType: "string",
      hideFromCollection: true,
    },
    stripeId: {
      name: "Stripe ID",
      dataType: "string",
      hideFromCollection: true,
    },
  },
});
