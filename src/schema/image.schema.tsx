export const imageSchema = {
    name: "Additional Image",
    properties: {
      url: {
        dataType: "string",
        title: "Image URL",
        validation: { required: true },
        storage: {
          mediaType: "image",
          storagePath: "additional_images",
          acceptedFiles: ["image/*"],
          metadata: {
            cacheControl: "max-age=1000000",
          },
        },
      },
    },
  };
  