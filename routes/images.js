const express = require('express');
const { decrypt } = require('../middlewares/crypto-helper');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const router = express.Router();
const { transformOnlineImage } = require('../safe-image');

const url = require('url');

router.get('/convert', (req, res) => {
  const { url: originalUrl, format } = req.query;

  if (!originalUrl || !format) {
    return res.status(400).json({ error: 'Missing image URL or format.' });
  }

  try {
    const parsed = new URL(originalUrl);
    const pathParts = parsed.pathname.split('/');

    // Insert the transformation part (like f_webp or f_png) after /upload
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      return res.status(400).json({ error: 'Invalid Cloudinary URL.' });
    }

    // Insert transformation like f_webp
    pathParts.splice(uploadIndex + 1, 0, `f_${format}`);

    // Reconstruct the transformed URL
    const transformedPath = pathParts.join('/');
    const transformedUrl = `${parsed.protocol}//${parsed.host}${transformedPath}`;

    return res.redirect(transformedUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }
});

// Main image route
router.post('/', async (req, res) => {
  const { url } = req.body;

  try {

    const finalImage = await transformOnlineImage(url);

    res.type('jpeg').send(finalImage);

  } catch (err) {
    console.error('✖ processing error:', err.message);
    res.status(502).send('unable to fetch or process image');
  }
});

// Main image route
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Image URL Submit</title>
      <style>
        body {
          background: linear-gradient(to right, #ff6aab, #ffa751);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }

        .container {
          background: white;
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 90%;
          max-width: 400px;
        }

        h2 {
          color: #ff4081;
          margin-bottom: 25px;
        }

        input[type="text"] {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #ffb3d1;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
        }

        input[type="text"]:focus {
          border-color: #ff4081;
        }

        button {
          margin-top: 20px;
          width: 100%;
          padding: 12px;
          background-color: #ff4081;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: #e73370;
        }

        @media (max-width: 500px) {
          .container {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Submit an Image URL</h2>
        <form action="/image" method="POST">
          <input type="text" name="url" placeholder="Enter image URL" required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </body>
    </html>
  `);
});


module.exports = router;
