import {
  buildCollection,
  buildProperty,
} from "firecms";

import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { Product } from "../types/product.type";
import { shippingOptionsCollection } from "./shipping-options.collection";

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

export const productsCollection = buildCollection<Product>({
  initialFilter: { archived: ["==", false] },
  name: "Products",
  icon: 'ShoppingCart',
  group: 'Commerce',
  singularName: "Product",
  path: "products",
  inlineEditing: true,
  textSearchEnabled: true,
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
      dataType: "boolean",
      defaultValue: false,
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
      validation: {
        required: true,
        requiredMessage: "You must set a description",
      },
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
      defaultValue: 'txcd_99999999'
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
      defaultValue: new Date()
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

    main_image_url: buildProperty({
      name: "Main Image URL",
      dataType: "string",
      readOnly: true, // Mark this field as read-only
      description: "Automatically generated download URL for the main image",
      hideFromCollection: true
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
    categories: {
      name: "Categories",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "string",
        enumValues: CATEGORIES,
      }
    },  
    stripe_id: {
      dataType: "string",
      name: "Stripe ID",
      description: "Reference to Stripe's product catalog",
      readOnly: true,
      hideFromCollection: true
    }
  },
  
  // Implementing onPreSave hook
  callbacks: {
    onPreSave: async ({ values }) => {
      if (values.main_image) {
        const storage = getStorage();
        const imageRef = ref(storage, values.main_image);
        try {
          const url = await getDownloadURL(imageRef);
          values.main_image_url = url; // Set the download URL in the read-only field
        } catch (error) {
          console.error("Error generating download URL:", error);
        }
      }
      return values;
    }
  }
});
