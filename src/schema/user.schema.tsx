import {
    buildCollection,
  } from "firecms";
import AdminActions from "../actions/admin.actions";


type User = {
    displayName: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    email: string;
    role: string;
  }

  export const usersCollection = buildCollection<User>({
  name: "Users",
  icon: 'Person',
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
  },
  Actions: [AdminActions] 

});