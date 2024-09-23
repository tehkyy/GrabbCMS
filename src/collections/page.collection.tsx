import {
  EntityReference,
  buildCollection,
} from "firecms";

import { GRABBIT_COLOR } from "../utils/colors.utils";
import AdminActions from "../actions/admin.actions";


type Page = {
  page_slug: string;
  page_title: string;
  page_body: string;
  header_section: {
    headline: string;
    subhead: string;
    body_copy: string;
    header_image: string;
    button_text: string;
  }
  promo_section: EntityReference;
  content_blocks: EntityReference[];
  createdAt: Date;
};


export const pagesCollection = buildCollection<Page>({
  name: "Pages",
  icon: 'Web',
  singularName: "Page",
  path: "pages",
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
    page_slug: {
      name: "Slug",
      dataType: "string",
      validation: {
        required: true,
        lowercase: true,
        unique: true,
      },

    },
    page_title: {
      name: "Title",
      validation: { required: true },
      dataType: "string"
    },
    page_body: {
      name: "Body",
      validation: { required: false },
      dataType: "string",
      markdown: true,
    },
    header_section: {
      dataType: "map",
      properties: {
        headline: {
          name: "Headline",
          validation: { required: false },
          dataType: "string"
        },
        subhead: {
          name: "Subhead",
          validation: { required: false },
          dataType: "string"
        },
        body_copy: {
          name: "Body Copy",
          validation: { required: false },
          dataType: "string"
        },
        header_image: {
          name: "Header Image",
          dataType: "string",
          validation: {
            required: false,
          },
          storage: {
            storagePath: "images",
            acceptedFiles: ["image/*"]
          }
        },
        button_text: {
          name: "Button Text",
          validation: { required: false },
          dataType: "string"
        }
      }
    },
    promo_section: {
      dataType: "reference",
      name: "Promo",
      description: "Reference to a promotion",
      path: "promotions"
    },
    content_blocks: {
      name: "Content Blocks",
      dataType: "array",
      of: {
        dataType: "reference",
        path: 'content'
      },
      description: "Additional content blocks",
      validation: { required: false },
    }
  },


});