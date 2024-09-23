import {
    buildCollection,
    buildProperty,
} from "firecms";


type Ticket = {
    title: string;
    createdAt: Date;
    description: string;
    images: string[];
    complete: boolean;
    status: string;
    severity: string;
};



export const ticketsCollection = buildCollection<Ticket>({
    initialFilter: { complete: ["==", false] },
    name: "Tickets",
    icon: 'Bug Report',
    singularName: "Ticket",
    path: "tickets",
    group: 'Admin',
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
        complete: {
            name: "Complete",
            validation: { required: true },
            dataType: "boolean"
        },
        status: {
            name: "Status",
            validation: { required: true },
            defaultValue: '1',
            dataType: "string",
            enumValues: [
                { id: "1", label: "Not Started", color: "grayDarker" },
                { id: "2", label: "In Progress", color: "tealLight" },
                { id: "4", label: "Stalled", color: "redDark" },
            ]
        },
        title: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            name: "Description",
            validation: { required: true },
            dataType: "string",
            multiline: true,
        },
        images: buildProperty({
            name: "Images",
            title: "Image URL",
            validation: { required: false },
            dataType: "array",
            of: {
              dataType: "string",
              storage: {
                mediaType: "image",
                storagePath: "ticket_support",
                acceptedFiles: ["image/*"],
                metadata: {
                  cacheControl: "max-age=1000000"
                }
              }
            },
          }),
        severity: {
            name: "Severity",
            validation: { required: true },
            dataType: "string",
            enumValues: [
                { id: "1", label: "Mild", color: "tealLight" },
                { id: "2", label: "Medium", color: "yellowDark" },
                { id: "3", label: "Spicy", color: "orangeDark" },
                { id: "4", label: "Atomic", color: "redDark" },
            ]
        },
    },

});