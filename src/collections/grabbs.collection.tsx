import {
    buildCollection,
  } from "firecms";

const CustomView = (entity: any, modifiedValues: any) => {

    return(
        <div>Custom View</div>
    )
}


export const grabbsCollection = buildCollection({
    name: "Grabbs",
    icon: 'Sell',
    singularName: "Grabb",
    path: "grabbs",
    properties: {
        createdAt: {
            name: 'Created',
            dataType: 'date',
            autoValue: "on_create"
        },
        slug: {
            name: "Slug",
            dataType: "string",
            validation: {
                required: true,
                lowercase: true,
                unique: true,
            },
        },
        product: {
            dataType: "reference",
            name: "Product",
            description: "Reference to product for this Grabb",
            path: "products",
            validation: {
                required: true,
            },
        },
    },
    textSearchEnabled: true
});
