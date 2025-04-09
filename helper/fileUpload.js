


const cloudinary = require("cloudinary").v2;

// Multiple Image Upload
exports.uploadProductImages = async (images, folderName) => {
  let imgUrl = [];
  for (let i = 0; i < images.length; i++) {
    try {
      let result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: folderName },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(images[i].data); // Using buffer instead of tempFilePath
      });

      imgUrl.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    } catch (error) {
      console.error(`Error uploading image ${i + 1}:`, error);
    }
  }
  return imgUrl;
};

// Multiple Image Destroy from Resource
exports.destroyProductImages = async (images) => {
  if (images.length === 0) {
    return {
      status: true,
      message: "No image to delete (handled scenario when previous image not available)",
    };
  }

  let deletedResults = [];

  for (let i = 0; i < images.length; i++) {
    try {
      if (images[i].public_id) {
        let result = await cloudinary.uploader.destroy(images[i].public_id);

        if (result.result === "ok") {
          deletedResults.push({
            public_id: images[i].public_id,
            status: "deleted",
          });
        } else {
          deletedResults.push({
            public_id: images[i].public_id,
            status: "failed",
            message: "Failed to delete image from resource",
          });
        }
      }
    } catch (error) {
      deletedResults.push({
        public_id: images[i].public_id,
        status: "error",
        message: error.message,
      });
    }
  }

  return {
    status: true,
    message: "Image deletion process complete",
    data: deletedResults,
  };
};

// Single Image Upload
exports.uploadSingleImage = async (image, folderName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: folderName },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(image.data); 
    });

    return {
      status: true,
      message: "Image uploaded successfully",
      data: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: "Image upload failed: " + error.message,
    };
  }
};

// Single Image Destroy
exports.deleteSingleImage = async (image) => {
  try {
    if (image.public_id) {
      const result = await cloudinary.uploader.destroy(image.public_id);

      if (result.result !== "ok") {
        return {
          status: false,
          message: "Image deletion failed",
        };
      }

      return {
        status: true,
        message: "Image deleted successfully",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: "Image deletion failed: " + error.message,
    };
  }
};
