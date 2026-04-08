import { buildProperty, EntityReference } from "firecms";

export type Grabb = {
    isActive: boolean;
    slug: string;
    product: EntityReference;
    quantity: number;
    originType: "user" | "floor" | "triggered";
    createdAt: Date;
    stripe_id: string;
}
