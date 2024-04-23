import {
  buildCollection,
  buildProperty,
  EntityReference,
  buildProperties,
  EntityCollection
} from "firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { CustomPricePreview } from "../previews/price";
import { imageSchema } from "./image.schema";

import ProductActions from "../actions/product.actions";
import AdminActions from "../actions/admin.actions";

const CATEGORIES = {
  electronics: "Electronics",
  giftcards: "Gift Cards",
  apparel: "Apparel",
  collectibles: "Collectibles",
  home: "Home",
  gaming: "Gaming",
  toys: "Toys"
}


const TAX_CODES = {
  txcd_99999999: "General - Tangible Goods",
  txcd_00000000: "Nontaxable",
  txcd_34020005: "Consumer Electronics Peripherals/Accessories",
  txcd_37010000: "Personal Computers",
  txcd_34020004: "Headphones/Earbuds",
  txcd_34021000: "Mobile Phones",
  txcd_34021001: "Mobile Phone Charging Device/cord",
  txcd_34022000: "Video Gaming Console - Fixed",
  txcd_34022001: "Video Gaming Console - Portable",
  txcd_30011000: "Clothing & Footwear",
  txcd_10502000: "Gift Card",
}

interface CheckoutFields {
  key?: string;
  label?: string;
  type?: string;
  options?: Object[];
}


type Product = {
  name: string;
  retailPrice: number;
  floorPrice: number;
  buyItNowPrice: number;
  shippingCost: number;
  taxCode: string;
  quantity: number;
  related_products: EntityReference[];
  main_image: string;
  cart_image: string;
  more_images: string[];
  tags: string[];
  descriptionHeading: string;
  description: string;
  categories: string[],
  specs: string;
  launch_time: Date;
  checkout_fields: CheckoutFields;
  archived: boolean;
  createdAt: Date;
}

export const productsCollection = buildCollection<Product>({
  initialFilter: { archived: ["==", false] },
  name: "Products",
  icon: 'ShoppingCart',
  group: 'Product',
  singularName: "Product",
  path: "products",
  inlineEditing: false,
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    delete: true
  }),
  properties: {
    createdAt:{
      name: 'Created',
      dataType: 'date',
      autoValue: "on_create"
    },
    archived: {
      name: "Archive",
      validation: { required: false },
      dataType: "boolean"
    }, 
    name: {
      name: "Name",
      validation: { 
        required: true,
        unique: true,
    },
    dataType: "string",
    },
    descriptionHeading: {
      name: "Description Heading",
      description: "Not mandatory but it'd be awesome if you filled this up",
      longDescription: "",
      dataType: "string",
      columnWidth: 300,
    },
    description: {
      name: "Description",
      description: "What is this thing?",
      longDescription: "",
      dataType: "string",
      columnWidth: 300,
      multiline: true,
    },
    specs: {
      name: "Specifications",
      validation: { required: false },
      dataType: "string",
      description: "What are all the deets for it?",
      columnWidth: 300,
      markdown: true,
    },
    retailPrice: buildProperty({
      name: "Retail Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price in cents between 0 and 100000",
        min: 0,
        max: 100000
      },
      description: "Price with range validation",
      dataType: "number",
      Preview: CustomPricePreview,
    }),
    buyItNowPrice: buildProperty({
      name: "Buy It Now Price",
      validation: {
        required: false,
        min: 0,
        max: 100000
      },
      description: "But it now price",
      dataType: "number",
      Preview: CustomPricePreview,
    }),
    floorPrice: buildProperty({
      name: "Floor Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price in cents between 0 and 100000",
        min: 0,
        max: 100000
      },
      description: "Price with range validation",
      dataType: "number",
      Preview: CustomPricePreview,
    }),
    shippingCost: {
      name: "Shipping Cost",
      validation: {
        required: false,
        min: 0,
        max: 100000
      },
      defaultValue: 0,
      description: "Shipping cost",
      dataType: "number",
    },
    taxCode: buildProperty({
      name: "Tax Code",
      validation: {
        required: true,
        requiredMessage: "You must set a tax code",
      },
      description: "Tax code for calculating appropriate taxes to collect",
      dataType: "string",
      enumValues: TAX_CODES,
    }),
    quantity: {
      name: "Quantity",
      validation: {
        required: true,
        requiredMessage: "You must set a quantity between 0 and 100000",
        min: 0,
        max: 100000
      },
      description: "Price with range validation",
      dataType: "number",
    },
    launch_time: buildProperty({
      name: "Launch Time",
      dataType: 'date',
      description: "When will this item be live on site?",
      validation: {
        required: true,
        requiredMessage: "All products must have a launch time.",
      },
    }),
    main_image: buildProperty({
      name: "Main Image",
      dataType: "string",
      storeUrl: "string",
      description: "Upload field for images",
      validation: {
        required: true,
        requiredMessage: "You must set a main image.",
      },
      storage: {
        mediaType: "image",
        storagePath: "images",
        acceptedFiles: ["image/*"],
        metadata: {
          cacheControl: "max-age=1000000"
        }
      },
    }),
    cart_image: buildProperty({
      name: "Cart Image",
      dataType: "string",
      storeUrl: "string",
      storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"]
      }
    }),
    more_images: buildProperty({
      name: "More Images",
      dataType: "array",
      of: {
        dataType: "string",
        storage: {
          storagePath: "images",
          acceptedFiles: ["image/*"],
          metadata: {
            cacheControl: "max-age=1000000"
          }
        }
      },
    }),
    tags: {
      name: "Tags",
      description: "Example of generic array",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "string"
      }
    },
    categories: {
      name: "Categories",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "string",
        enumValues: CATEGORIES,
      }
    },
    related_products: {
      dataType: "array",
      name: "Related products",
      description: "Reference to self",
      of: {
        dataType: "reference",
        path: "products"
      }
    },
    checkout_fields: ({ values }) => {
      const checkoutFields: CheckoutFields = values.checkout_fields || {};
      const properties = buildProperties<any>({
        label: {
          name: "Label",
          dataType: "string",
        },
        key: {
          name: "Key",
          dataType: "string"
        },
        type: {
          name: "Type",
          dataType: "string",
          enumValues: {
            text: "Text",
            number: "Numeric",
            dropdown: "Dropdown"
          },
        },
      });
    
      if (values.checkout_fields) {
        if (values.checkout_fields.type === "dropdown") {
          properties["options"] = buildProperty({
            name: "Custom Dropdown Options",
            dataType: "array",
            of: {
              dataType: "map",
              name: "Option",
              properties: {
                label: {
                  name: "Label",
                  dataType: "string",
                },
                value: {
                  name: "Value",
                  dataType: "string",
                }
              },
            },
          });
        }
      }
    
      return {
        dataType: "map",
        name: "Additional Checkout Fields",
        properties: properties,
      };
    }
    
  },
<<<<<<< HEAD
  Actions: [AdminActions] 
=======
  Actions: [ProductActions, AdminActions] 
>>>>>>> 055890a (many updates…)

});

