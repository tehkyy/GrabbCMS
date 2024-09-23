import {
    buildCollection,
  } from "firecms";

  
  export const queueCollection = buildCollection({
    name: "Queue Products",
    group:'Product',
    icon: 'Queue',
    singularName: "Queued Product",
    path: "grabb_q",
    permissions: ({ authController }) => ({
      edit: true,
      create: true,
      delete: true
    }),
  
    properties: {
      createdAt:{
        name: 'Created',
        dataType: 'date',
        autoValue: "on_create",
        hideFromCollection: true,
        readOnly: true,
      },
      product: {
        dataType: "reference",
        name: "Product Queue",
        description: "Reference to self",
        path: "products",
        previewProperties: ["main_image", "name"]

      },
    },
    

  });
  