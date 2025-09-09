import {
  buildCollection,
} from "firecms";


export const settingsCollection = buildCollection({
name: "Settings",
icon: 'Gear',
singularName: "Setting",
path: "settings",
group: 'Admin',
customId: true,

properties: {
  value: {
    name: "active",
    validation: { required: true },
    defaultValue: false,
    dataType: "boolean"
  }
},

});