import { EntityReference } from "firecms";

export type Product = {
  name: string;
  retailPrice: number;
  floorPrice: number;
  shippingCost: number;
  taxCode: string;
  quantity: number;
  quantityQueued: number;
  main_image: string;
  main_image_url: string;
  cart_image: string;
  more_images: string[];
  descriptionHeading: string;
  description: string;
  categories: string[];
  specs: string;
  launch_time: Date;
  archived: boolean;
  createdAt: Date;
  stripe_id: string;
};

export type ProductRun = {
  originType: "manual" | "floor_requeue" | "abandonment_requeue";
  previousRunId: string | null;
  nextRunId: string | null;
  queueEntryId: string | null;
  startedAt: Date;
  endedAt: Date | null;
  endReason: "sold_out" | "manual_stop" | null;
  startingPrice: number;
  floorPrice: number;
  quantityStart: number;
  quantityRemaining: number;
  paidCount: number;
  floorHitCount: number;
  abandonmentCount: number;
  slug: string;
  stripeId: string;
};
