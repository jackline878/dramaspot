const multer = require('multer');
const { storage } = require('./cloudinary');

const upload = multer({ storage });

module.exports = upload;
// This middleware uses multer with Cloudinary storage to handle file uploads.
// It can be used in routes to handle file uploads, for example: