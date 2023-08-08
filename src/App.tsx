import React, { useCallback } from "react";

import { User as FirebaseUser } from "firebase/auth";

import {
  Authenticator,
  buildCollection,
  buildProperty,
  EntityReference,
  FirebaseCMSApp,
} from "firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { Preview } from "@mui/icons-material";

import { CustomPricePreview } from "./previews/price";

// Production Config
const firebaseConfig = {
  apiKey: "AIzaSyB7WREdD0qbva7z_IczthA_mFwlYyFfzCE",
  authDomain: "grabbit-370315.firebaseapp.com",
  databaseURL: "https://grabbit-370315-default-rtdb.firebaseio.com",
  projectId: "grabbit-370315",
  storageBucket: "grabbit-370315.appspot.com",
  messagingSenderId: "752720519034",
  appId: "1:752720519034:web:a75de670a0f1fa4945c0c3",
  measurementId: "G-4NE9Q3C3BQ"
};

//Dev config
// const firebaseConfig = {
//   apiKey: "AIzaSyDC6b8-KRk-OvnsL9Uk-xVIrrUkFNlz6cA",
//   authDomain: "grabbit-dev-b598a.firebaseapp.com",
//   databaseURL: "https://grabbit-dev-b598a-default-rtdb.firebaseio.com",
//   projectId: "grabbit-dev-b598a",
//   storageBucket: "grabbit-dev-b598a.appspot.com",
//   messagingSenderId: "16188557936",
//   appId: "1:16188557936:web:5eafafa096a59e411ac2b5"
// };


const locales = {
  "en-US": "English (United States)",
  "es-ES": "Spanish (Spain)",
  "de-DE": "German"
};

type Product = {
  name: string;
  retailPrice: number;
  floorPrice: number;
  quantity: number;
  related_products: EntityReference[];
  main_image: string;
  cart_image: string;
  tags: string[];
  descriptionHeading: string;
  description: string;
  categories: string[],
  specs: string;
  launch_time: Date;
}

type ProductQueue = {
  product: EntityReference;
}

type User = {
  displayName: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  email: string;
  role: string;
}

type Page = {
  page_slug: string;
  page_title: string;
  page_body: string;
}

const localeCollection = buildCollection({
  path: "locale",
  customId: locales,
  name: "Locales",
  singularName: "Locales",
  properties: {
    name: {
      name: "Title",
      validation: { required: true },
      dataType: "string"
    },
    selectable: {
      name: "Selectable",
      description: "Is this locale selectable",
      dataType: "boolean"
    },
    video: {
      name: "Video",
      dataType: "string",
      validation: { required: false },
      storage: {
        storagePath: "videos",
        acceptedFiles: ["video/*"]
      }
    }
  }
});

const productsCollection = buildCollection<Product>({
  name: "Products",
  singularName: "Product",
  path: "products",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    // we have created the roles object in the navigation builder
    delete: true
  }),
  subcollections: [
    localeCollection
  ],
  properties: {
    name: {
      name: "Name",
      validation: { required: true },
      dataType: "string"
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
    }),
    main_image: buildProperty({
      name: "Main Image",
      dataType: "string",
      storeUrl: "string",
      storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"]
      }
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
    specs:{
      name: "Specifications",
      validation: { required: false },
      dataType: "string",
      description: "What are all the deets for it?",
      columnWidth: 300,
      markdown: true,
    },
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
        enumValues: {
          electronics: "Electronics",
          giftcards: "Gift Cards"
        }
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
  }
});

const queueCollection = buildCollection<ProductQueue>({
  name: "Queue Products",
  singularName: "Queued Product",
  path: "grabb_q",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    // we have created the roles object in the navigation builder
    delete: true
  }),

  properties: {
    product: {
      dataType: "reference",
      name: "Product Queue",
      description: "Reference to self",
      path: "products"
    },
  }
});

const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    // we have created the roles object in the navigation builder
    delete: true
  }),

  properties: {
    displayName: {
      name: "Display Name",
      validation: { required: true },
      dataType: "string"
    },
    firstName: {
      name: "First Name",
      validation: { required: false },
      dataType: "string"
    },
    lastName: {
      name: "Last Name",
      validation: { required: false },
      dataType: "string"
    },
    createdAt: {
      name: "Created At",
      validation: { required: true },
      dataType: "date"
    },
    email: {
      name: "Email",
      validation: { required: true },
      dataType: "string",
    },
    role:{
      name: "Role",
      validation: { required: true },
      dataType: "string",
    }
  }

});

const pagesCollection = buildCollection<Page>({
  name: "Pages",
  singularName: "Page",
  path: "pages",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    delete: true
  }),

  properties: {
    page_slug: {
      name: "Slug",
      validation: { required: true },
      dataType: "string"
    },
    page_title: {
      name: "Title",
      validation: { required: true },
      dataType: "string"
    },
    page_body: {
      name: "Body",
      validation: { required: true },
      dataType: "string",
      markdown: true,
    },
  }

});



export default function App() {

  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
    user,
    authController
  }) => {

    if (user?.email?.includes("flanders")) {
      throw Error("Access Denied");
    }

    console.log("Allowing access to", user?.email);

    // This is an example of retrieving async data related to the user
    // and storing it in the user extra field.

    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
  }, []);

  
  
  return <FirebaseCMSApp
    name={"Grabbit"}
    authentication={myAuthenticator}
    collections={[productsCollection, usersCollection, pagesCollection, queueCollection]}
    firebaseConfig={firebaseConfig}
  />;
}