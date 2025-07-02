// Assuming you have installed cloudinary SDK
// npm install cloudinary

const cloudinary = require('cloudinary').v2;
require("dotenv").config();

// Configure your credentials
cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET, 
});

// Generate a URL with transformations
const publicId = 'my_uploads/1750966414177-Untitledd'; // your image's public ID on Cloudinary
const width = 720;
const height = 405;

const transformedUrl = cloudinary.url(publicId, {
  width: width,
  height: height,
  crop: 'fill',
  format: 'webp',
});

console.log('Transformed URL:', transformedUrl);

// Example output:
// https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/c_fill,w_720,h_405/sample-image-id.webp
