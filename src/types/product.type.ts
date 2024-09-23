import { EntityReference } from "firecms";

export type Product = {
  name: string;
  retailPrice: number;
  floorPrice: number;
  buyItNowPrice: number;
  shippingCost: number;
  taxCode: string;
  quantity: number;
  main_image: string;
  main_image_url: string;
  cart_image: string;
  more_images: string[];
  descriptionHeading: string;
  description: string;
  categories: string[],
  specs: string;
  launch_time: Date;
  archived: boolean;
  createdAt: Date;
  stripe_id: string
}
