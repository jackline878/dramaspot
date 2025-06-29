const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'my_uploads', // customize folder
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // optional
    };
  },
});

/**
 * Delete a Cloudinary file by its full URL.
 * Automatically detects if it’s a video or image.
 * @param {string} fileUrl - Full URL of the file from Cloudinary
 * @returns {Promise<object>}
 */
async function deleteFromCloudinary(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const pathname = url.pathname; // e.g. /your-cloud-name/image/upload/v123456/my_uploads/image.jpg

    // Extract type and path
    const parts = pathname.split('/');
    const resourceTypeIndex = parts.indexOf('upload') - 1;
    const resourceType = parts[resourceTypeIndex]; // image or video

    const fileWithExtension = parts.slice(-1)[0]; // image.jpg
    const publicIdWithoutExt = fileWithExtension.split('.')[0];

    const folderPath = parts.slice(resourceTypeIndex + 2, -1).join('/'); // e.g., my_uploads
    const publicId = folderPath ? `${folderPath}/${publicIdWithoutExt}` : publicIdWithoutExt;

    console.log('Deleting from Cloudinary:', { publicId, resourceType });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
}

module.exports = {
  cloudinary,
  storage,
  deleteFromCloudinary
};
