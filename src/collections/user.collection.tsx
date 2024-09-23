import {
  buildCollection,
} from "firecms";


export const usersCollection = buildCollection({
name: "Users",
icon: 'Person',
singularName: "User",
path: "users",
group: 'Commerce',

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
    dataType: "number",
    enumValues: [
      { id: 1, label: "Guest", color: "grayDark" },
      { id: 2, label: "User", color: "blueDark" },
      { id: 3, label: "Admin", color: "greenDark" },
      { id: 4, label: "SuperAdmin", color: "purpleDarker" },
  ]
  }
},

});