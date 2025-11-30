const express = require('express');
const articleController = require('../controllers/article.controller');
const userController = require('../controllers/user.controller');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const cookie = require('../middlewares/set_cookie.js');
const countWordsOnWebsite = require('../count.js');

const visitorTracker = require('../middlewares/visitorTracker');

const { renderArticle } = require('../render/article');
// Create a new article
router.post('/', checkAuthMiddleware.admin, upload.any(), articleController.createArticles);
router.post('/bit/', checkAuthMiddleware.admin, upload.any(), articleController.createArticle);
router.post('/sections/', checkAuthMiddleware.admin, articleController.createSections);
router.post('/sections/:sectionId/contents', checkAuthMiddleware.admin, upload.any(), articleController.createSectionContents);
// Get all articles
router.get('/all', articleController.getArticles);

router.get('/all/articles', articleController.getAllArticles);
router.get('/add', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('create.html', { root: __dirname + '/../admin' });
});

router.get('/add/bit', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('create-article.html', { root: __dirname + '/../admin' });
});

router.get('/count/words', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Word Counter</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: #f9f9f9;
          margin: 0;
          padding: 2rem;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
          margin-bottom: 1rem;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        input[type="url"] {
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 1rem;
        }
        button {
          padding: 0.75rem;
          background: #ff00b3ff;
          border: none;
          border-radius: 5px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }
        button:hover {
          background: #b3007dff;
        }
        .result {
          margin-top: 1rem;
          font-weight: bold;
        }
        .error {
          color: red;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Website Word Counter</h1>
        <form method="POST" action="/article/count/words">
          <input type="url" name="url" placeholder="Enter website URL" required />
          <button type="submit">Count Words</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

router.post('/count/words', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.send(`
      <p class="error">❌ URL is required.</p>
      <a href="/article/count/words">Go back</a>
    `);
  }

  try {
    const wordCount = await countWordsOnWebsite(url);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Word Count Result</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f2f2f2;
            padding: 2rem;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h2 {
            color: #333;
          }
          .count {
            font-size: 2rem;
            color: #007bff;
            margin: 1rem 0;
          }
          a {
            display: inline-block;
            margin-top: 1rem;
            text-decoration: none;
            color: #007bff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>✅ Word Count for:</h2>
          <p>${url}</p>
          <div class="count">${wordCount} words</div>
          <a href="/article/count/words">🔁 Count Another</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <p class="error">❌ Failed to fetch or parse the page: ${error.message}</p>
      <a href="/article/count/words">Try again</a>
    `);
  }
});

router.get('/content/add', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('add content.html', { root: __dirname + '/../admin' });
});
router.get('/section/add', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('create_section.html', { root: __dirname + '/../admin' });
});

router.get('/edit', checkAuthMiddleware.admin, async (req, res) => {
    const {slug} = req.query
    res.sendFile(`update.html`, { root: __dirname + '/../admin' });
});


// Get article by ID
router.get('/id/edit/:id', checkAuthMiddleware.isUser, articleController.getArticleforEdit);
router.get('/id/:id', checkAuthMiddleware.isUser, articleController.getArticleById,);
router.get('/section/:id', checkAuthMiddleware.isUser, articleController.getSectionById,);

// Get article by slug
router.get('/:slug', checkAuthMiddleware.isUser, articleController.getArticleBySlug, visitorTracker, renderArticle);
router.post('/share', checkAuthMiddleware.isUser, articleController.shareBySlug);

// Get articles by category
//router.get('/category/:categoryId', articleController.getArticleByCategory);

// Update article by ID
router.put('/:id', checkAuthMiddleware.admin, upload.any(), articleController.updateArticle);
router.put('/sections/reorder', checkAuthMiddleware.admin, articleController.updateSection);
router.put('/content/update', checkAuthMiddleware.admin, upload.any(), articleController.updateContent);
router.put('/sections/:sectionId/contents/:contentId', checkAuthMiddleware.admin, upload.any(), articleController.updateSectionContent);

// Delete article by ID
router.put('/publish/:id', checkAuthMiddleware.admin, articleController.publishArticle);
router.delete('/:id', checkAuthMiddleware.admin, articleController.deleteArticle);
router.delete('/sections/:id', checkAuthMiddleware.admin, articleController.deleteSection);
router.delete('/contents/:id', checkAuthMiddleware.admin, articleController.deleteSectionContent);


module.exports = router;