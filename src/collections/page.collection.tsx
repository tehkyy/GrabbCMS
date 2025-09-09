import { buildCollection } from "firecms";

export const pagesCollection = buildCollection({
  name: "Pages",
  path: "pages",
  properties: {
    page_slug: {
      name: "Slug",
      dataType: "string",
      validation: { required: true }
    },
    page_title: {
      name: "Title",
      dataType: "string",
      validation: { required: true }
    },
    template: {
      name: "Template",
      dataType: "string",
      enumValues: {
        default: "Default",
        howItWorks: "How It Works",
        faq: "FAQ",
        contact: "Contact"
      }
    },
    seo: {
      name: "SEO",
      dataType: "map",
      properties: {
        title: { 
          name: "Meta Title",
          dataType: "string"
        },
        description: { 
          name: "Meta Description",
          dataType: "string"
        },
        keywords: { 
          name: "Keywords",
          dataType: "array", of: { dataType: "string" } 
        }
      }
    },
    navigation: {
      name: "Navigation",
      dataType: "map",
      properties: {
        includeInMenu: { 
          name: "Include In Menu?",
          dataType: "boolean"
         },
        menuLabel: { 
          name: "Label",
          dataType: "string" 
        },
        order: { 
          name: "Order In Menu",
          dataType: "number" 
        }
      }
    },
    content_blocks: {
      name: "Content Blocks",
      dataType: "array",
      of: {
        dataType: "map",
        properties: {
          type: {
            dataType: "string",
            enumValues: {
              hero: "Hero",
              text: "Text",
              image: "Image",
              cta: "Call to Action",
              faq: "FAQ"
            }
          },
          content: {
            dataType: "map",
            properties: {
              // Define properties based on the 'type' selected
            }
          }
        }
      }
    }
  }
});
