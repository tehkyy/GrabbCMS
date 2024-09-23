import {
    buildCollection,
    buildProperty,
} from "firecms";
import { ShippingOption } from "../types/shipping.type";

export const shippingOptionsCollection = buildCollection<ShippingOption>({
    name: "Shipping Options",
    icon: 'LocalShipping',
    group: 'Commerce',
    singularName: "Shipping Option",
    path: "shipping",
    inlineEditing: true,
    permissions: ({ authController }) => ({
        edit: true,
        create: true,
        delete: true
    }),
    properties: {
        display_name: buildProperty({
            name: "Display Name",
            validation: { required: true },
            dataType: "string",
        }),
        active: buildProperty({
            name: "Active",
            validation: { required: true },
            dataType: "boolean",
            defaultValue: true
        }),
        stripe_shipping_rate_id: buildProperty({
            name: 'Stripe Shipping Rate ID',
            dataType: 'string',
            readOnly: true,
            hideFromCollection: true
        }),
        created: buildProperty({
            name: 'Created',
            dataType: 'number',
            readOnly: true,
            hideFromCollection: true
        }),
        delivery_estimate: buildProperty({
            name: "Delivery Estimate",
            dataType: "map",
            properties: {
                minimum: buildProperty({
                    name: "Minimum",
                    dataType: "map",
                    properties: {
                        value: buildProperty({
                            name: "Value",
                            validation: { required: false },
                            dataType: "number"
                        }),
                        unit: buildProperty({
                            name: "Unit",
                            validation: { required: false },
                            dataType: "string",
                            enumValues: [
                                { id: "business_day", label: "Business Day" },
                                { id: "calendar_day", label: "Calendar Day" }
                            ]
                        })
                    }
                }),
                maximum: buildProperty({
                    name: "Maximum",
                    dataType: "map",
                    properties: {
                        value: buildProperty({
                            name: "Value",
                            validation: { required: false },
                            dataType: "number"
                        }),
                        unit: buildProperty({
                            name: "Unit",
                            validation: { required: false },
                            dataType: "string",
                            enumValues: [
                                { id: "business_day", label: "Business Day" },
                                { id: "calendar_day", label: "Calendar Day" }
                            ]
                        })
                    }
                }),
            }
        }),
        fixed_amount: buildProperty<{ amount: number, currency: string }>({
            name: "Fixed Amount",
            dataType: "map",
            properties: {
                amount: buildProperty({
                    name: "Amount",
                    validation: { required: true },
                    dataType: "number"
                }),
                currency: buildProperty({
                    name: "Currency",
                    validation: { required: true },
                    dataType: "string",
                    defaultValue: "usd",
                    enumValues: [
                        { id: "usd", label: "Dollars" },
                    ]
                })
            }
        }),
        livemode: buildProperty({
            name: 'Live Mode',
            dataType: 'boolean',
            defaultValue: false
        }),
        tax_behavior: buildProperty({
            name: "Tax Behavior",
            dataType: "string",
            validation: { required: false },
            enumValues: [
                { id: "inclusive", label: "Inclusive" },
                { id: "exclusive", label: "Exclusive" },
                { id: "unspecified", label: "Unspecified" }
            ],
            defaultValue: "exclusive"
        }),
        tax_code: buildProperty({
            name: "Tax Code",
            dataType: "string",
            validation: { required: false },
            defaultValue: 'shipping',
            enumValues: [
                { id: "shipping", label: "Shipping" },
                { id: "nontaxable", label: "Nontaxable" },
            ]
        }),
        type: buildProperty({
            name: "Type",
            dataType: "string",
            defaultValue: "fixed_amount",
            readOnly: true,
            validation: { required: true },
            hideFromCollection: true
        })
    }
});
