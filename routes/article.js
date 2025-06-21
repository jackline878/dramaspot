const express = require('express');
const articleController = require('../controllers/article.controller');
const userController = require('../controllers/user.controller');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const cookie = require('../middlewares/set_cookie.js');
const { renderArticle } = require('../render/article');
// Create a new article
router.post('/', checkAuthMiddleware.admin, upload.any(), articleController.createArticle);

// Get all articles
router.get('/all', articleController.getArticles);
router.get('/add', async (req, res) => {
    res.sendFile('create.html', { root: __dirname + '/../admin' });
});

// Get article by ID
//router.get('/:id', checkAuthMiddleware.isUser, articleController.getArticleById, renderArticle);

// Get article by slug
router.get('/:slug', checkAuthMiddleware.isUser, articleController.getArticleBySlug, renderArticle);

// Get articles by category
//router.get('/category/:categoryId', articleController.getArticleByCategory);

// Update article by ID
router.put('/:id', articleController.updateArticle, renderArticle);

// Delete article by ID
router.delete('/:id', articleController.deleteArticle);

module.exports = router;