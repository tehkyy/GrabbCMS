import {
  buildCollection,
} from "firecms";


export const contentBlockCollection = buildCollection({
  name: "Content Blocks",
  icon: 'Category',
  singularName: "Content Block",
  path: "content",
  group: 'Content',
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    delete: true
  }),

  properties: {
    createdAt: {
      name: 'Created',
      dataType: 'date',
      autoValue: "on_create"
    },
    block_title: {
      name: "Title",
      dataType: "string",
      validation: {
        required: true,
        lowercase: true,
        unique: true,
      },
      description: "A unique name or title for this block",
      columnWidth: 300,

    },
    block_heading: {
      name: "Heading",
      validation: { required: false },
      description: "The heading (H1) or headline for this block",
      dataType: "string"
    },
    block_body: {
      name: "Body",
      validation: { required: true },
      description: "The body content for this block",
      dataType: "string",
      markdown: true,
    },

  },


});