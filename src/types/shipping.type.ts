export type ShippingOption = {
    id?: string;
    object?: string;
    active?: boolean;
    created?: number;
    stripe_shipping_rate_id: string,
    delivery_estimate?: {
      minimum?: {
        unit: 'business_day' | 'calendar_day';
        value: number;
      };
      maximum?: {
        unit: 'business_day' | 'calendar_day';
        value: number;
      };
    } | null;
    display_name: string;
    fixed_amount: {
      amount: number;
      currency: string;
    };
    livemode?: boolean;
    metadata?: Record<string, string>;
    tax_behavior?: 'inclusive' | 'exclusive' | 'unspecified';
    tax_code?: string | null;
    type: "fixed_amount";
  };
  