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

module.exports = {
  cloudinary,
  storage
};
