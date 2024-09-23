import {
      buildCollection,
      buildProperty,
    } from "firecms";
  
  import { GRABBIT_COLOR } from "../utils/colors.utils";
import AdminActions from "../actions/admin.actions";
  
  
  type Release = {
      createdAt: Date;
      publication_date: Date;
      updated: Date,
      page_slug: string;
      page_title: string;
      headline: string;
      subhead: string;
      body_copy: string;
    };
  
    
  export const pressReleaseCollection = buildCollection<Release>({
      name: "Press Releases",
      icon: 'Newspaper',
      singularName: "Press Release",
      path: "press",
      group:'Content',
      permissions: ({ authController }) => ({
        edit: true,
        create: true,
        delete: true
      }),
    
      properties: {
        updated: buildProperty({
            dataType: "date",
            name: "Updated at",
            autoValue: "on_update"
        }),
        page_slug: {
          name: "Slug",
          validation: { 
            required: true,
            lowercase: true,
            unique: true,
        },
          dataType: "string",
          description: "A url friendly title, all lowercase, no spaces, _ and - are allowed",
        },
        publication_date: buildProperty({
            dataType: "date",
            name: "Publication Date",
            autoValue: "on_create",
            hideFromCollection: true

        }),
        createdAt: buildProperty({
          dataType: "date",
          name: "Created Date",
          autoValue: "on_create",
          hideFromCollection: true
      }),
        page_title: {
          name: "Title",
          validation: { required: true },
          dataType: "string",
          description: "Press Release Title"
        },
        headline: {
            name: "Headline",
            validation: { required: false },
            dataType: "string",
          },
          subhead: {
            name: "Subhead",
            validation: { required: false },
            dataType: "string"
          },
          body_copy:{
            name: "Body Copy",
            validation: { required: true },
            dataType: "string",
            markdown: true,
          },
      },

      

    });