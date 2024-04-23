import {
    buildCollection,
    EntityReference,
  } from "firecms";
import AdminActions from "../actions/admin.actions";

type ProductQueue = {
    product: EntityReference;
    createdAt: Date;
  }
  
  export const queueCollection = buildCollection<ProductQueue>({
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
        autoValue: "on_create"
      },
      product: {
        dataType: "reference",
        name: "Product Queue",
        description: "Reference to self",
        path: "products"
      },
    },
    Actions: [AdminActions] 

  });
  