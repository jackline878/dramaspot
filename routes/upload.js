const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

// For single image/video
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ url: req.file }); // secure_url
});

router.get('/upload', upload.single('image'), (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Image Upload with Copyable Link</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light p-5">

<div class="container">
  <div class="card shadow-sm">
    <div class="card-body">
      <h3 class="card-title mb-4">Upload an Image</h3>
      
      <!-- Upload Form -->
      <form id="uploadForm">
        <div class="mb-3">
          <label for="image" class="form-label">Choose an image</label>
          <input class="form-control" type="file" id="image" name="image" accept="image/*" required>
        </div>
        <button type="submit" class="btn btn-primary">Upload</button>
      </form>

      <!-- Result -->
      <div id="result" class="mt-4 d-none">
        <h5>Uploaded Image:</h5>
        <img id="previewImage" class="img-fluid rounded mb-3" alt="Uploaded image">

        <label class="form-label">Image Link:</label>
        <div class="input-group mb-3">
          <input type="text" id="imageLink" class="form-control" readonly>
          <button class="btn btn-outline-secondary" type="button" id="copyBtn">Copy</button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('image');
  if (!fileInput.files.length) {
    alert('Please select an image first.');
    return;
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json();
    console.log('Server response:', data);

    // Extract the correct URL from server response
    const imageUrl = data.url.path || data.url.secure_url || data.url; 

    // Display preview and link
    document.getElementById('previewImage').src = imageUrl;
    document.getElementById('imageLink').value = imageUrl;
    document.getElementById('result').classList.remove('d-none');

  } catch (err) {
    console.error(err);
    alert('Error uploading image.');
  }
});

// Copy to clipboard
document.getElementById('copyBtn').addEventListener('click', () => {
  const linkInput = document.getElementById('imageLink');
  linkInput.select();
  linkInput.setSelectionRange(0, 99999); // For mobile
  document.execCommand('copy');
  alert('Link copied to clipboard!');
});
</script>

</body>
</html>

    `); // secure_url
});

// For multiple images/videos
router.post('/uploads', upload.array('images', 10), (req, res) => {
  const urls = req.files
  res.json({ urls });
});

module.exports = router;
