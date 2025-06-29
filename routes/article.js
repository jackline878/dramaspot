const express = require('express');
const articleController = require('../controllers/article.controller');
const userController = require('../controllers/user.controller');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const cookie = require('../middlewares/set_cookie.js');

const visitorTracker = require('../middlewares/visitorTracker');

const { renderArticle } = require('../render/article');
// Create a new article
router.post('/', checkAuthMiddleware.admin, upload.any(), articleController.createArticles);
router.post('/bit/', checkAuthMiddleware.admin, upload.any(), articleController.createArticle);
router.post('/sections/', checkAuthMiddleware.admin, articleController.createSections);
router.post('/sections/:sectionId/contents', checkAuthMiddleware.admin, upload.any(), articleController.createSectionContents);
// Get all articles
router.get('/all', articleController.getArticles);
router.get('/add', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('create.html', { root: __dirname + '/../admin' });
});

router.get('/add/bit', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('create-article.html', { root: __dirname + '/../admin' });
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
router.put('/sections/:sectionId/contents/:contentId', checkAuthMiddleware.admin, upload.any(), articleController.updateSectionContent);

// Delete article by ID
router.put('/publish/:id', checkAuthMiddleware.admin, articleController.publishArticle);
router.delete('/:id', checkAuthMiddleware.admin, articleController.deleteArticle);
router.delete('/sections/:id', checkAuthMiddleware.admin, articleController.deleteSection);
router.delete('/contents/:id', checkAuthMiddleware.admin, articleController.deleteSectionContent);


module.exports = router;