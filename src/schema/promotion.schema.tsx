import {
    buildCollection,
    EntityReference,
    buildProperty,
  } from "firecms";
import AdminActions from "../actions/admin.actions";


type Promotion = {
    image: string;
    headline: string;
    subhead: string;
    link: string;
    product: EntityReference;
    description: string;
    button_text: string;
    createdAt: Date;
  }

  export const promotionCollection = buildCollection<Promotion>({
    name: "Promotions ",
    group:'Page',
    icon: 'Campaign',
    singularName: "Promotion",
    path: "promotions",
    customId: true,
    description:'Promotions',
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
        image: buildProperty({
            name: "Promotion Image",
            dataType: "string",
            storeUrl: "string",
            description: "Upload an image for the promotion",
            validation: {
              required: false,
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
        headline:{
            name: "Headline",
            validation: { required: false },
            dataType: "string",
        },
        subhead: {
            name: "Subhead",
            validation: { required: false },
            dataType: "string"  
        },
        description: {
            name: "Description",
            validation: { required: false },
            dataType: "string",
            markdown: true,
        },
        link: {
            name: "Promotion Link",
            description: "If provided, this is where a button click will send users",
            validation: { required: false },
            dataType: "string"
        },
        button_text:{
            name: "Button Text",
            validation: { required: false },
            dataType: "string"
          },
          product: {
            dataType: "reference",
            name: "Product",
            description: "Reference to product for the promotion",
            path: "products",
          },
    },
    Actions: [AdminActions] 

  });
  
  