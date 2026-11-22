
import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (imageBuffer) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "taskflow-ai",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(imageBuffer);
    });

    return {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    throw new Error("Failed to upload image.");
  }
};
