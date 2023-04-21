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

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const locales = {
  "en-US": "English (United States)",
  "es-ES": "Spanish (Spain)",
  "de-DE": "German"
};




type Product = {
  name: string;
  retailPrice: number;
  quantity: number;
  status: string;
  published: boolean;
  related_products: EntityReference[];
  main_image: string;
  tags: string[];
  descriptionHeading: string;
  description: string;
  categories: string[],
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
    retailPrice: {
      name: "Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price in cents between 0 and 100000",
        min: 0,
        max: 100000
      },
      description: "Price with range validation",
      dataType: "number"
    },
    quantity: {
      name: "Quantity",
      validation: {
        required: true,
        requiredMessage: "You must set a quantity between 0 and 100000",
        min: 0,
        max: 100000
      },
      description: "Price with range validation",
      dataType: "number"
    },
    status: {
      name: "Status",
      validation: { required: true },
      dataType: "string",
      description: "Should this product be visible in the website",
      longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      enumValues: {
        private: "Private",
        public: "Public"
      }
    },
    published: ({ values }) => buildProperty({
      name: "Published",
      dataType: "boolean",
      columnWidth: 100,
      disabled: (
        values.status === "public"
          ? false
          : {
            clearOnDisabled: true,
            disabledMessage: "Status must be public in order to enable this the published flag"
          }
      )
    }),
    related_products: {
      dataType: "array",
      name: "Related products",
      description: "Reference to self",
      of: {
        dataType: "reference",
        path: "products"
      }
    },
    main_image: buildProperty({ // The `buildProperty` method is a utility function used for type checking
      name: "Image",
      dataType: "string",
      storeUrl: "string",
      storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"]
      }
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
    descriptionHeading: {
      name: "Description Heading",
      description: "Not mandatory but it'd be awesome if you filled this up",
      longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      dataType: "string",
      columnWidth: 300
    },
    description: {
      name: "Description",
      description: "What is this thing?",
      longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      dataType: "string",
      columnWidth: 300
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
    collections={[productsCollection, usersCollection, pagesCollection]}
    firebaseConfig={firebaseConfig}
  />;
}