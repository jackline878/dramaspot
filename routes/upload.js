const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

// For single image/video
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ url: req.file }); // secure_url
});

// For multiple images/videos
router.post('/uploads', upload.array('images', 10), (req, res) => {
  const urls = req.files
  res.json({ urls });
});

module.exports = router;
