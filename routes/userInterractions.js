// routes/userInteractions.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/userInteractionController');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const { renderHome } = require('../render/home');
const { renderCategory } = require('../render/category');
const { renderHashtag } = require('../render/hashtag');
const { renderSearch } = require('../render/search');
const visitorTracker = require('../middlewares/visitorTracker');

// Log an interaction
router.get('/interractions', controller.getInteractions);

// Get trending articles
router.get('/trending', controller.getTrendingArticles);
// routes/userInteractions.js

router.get('/',checkAuthMiddleware.isUser, controller.getHomePageContent,visitorTracker, renderHome);
router.get('/search',checkAuthMiddleware.isUser, async(req, res, next) => {req.path = `/search?q=${req.query.q}`;next();}, visitorTracker, renderSearch);
router.get('/homepage/search/:search', controller.search);
router.get('/articles/all/latest', controller.getLatestArticlesPage);
router.get('/category/articles/all/latest/:categoryName', controller.getLatestCategoryArticlesPage);
router.get('/hashtag/articles/all/latest/:hashtagName', controller.getLatestTagArticlesPage);
router.get('/category/:categoryName',checkAuthMiddleware.isUser, controller.getCategoryPageContent,visitorTracker, renderCategory);
router.get('/hashtag/:hashtagName',checkAuthMiddleware.isUser, controller.getHashtagPageContent,visitorTracker, renderHashtag);
router.get('/recommended/:user_id', controller.getRecommendedArticles);
router.get('/recommended/article/:article_id/:user_id', controller.getSimilarArticlesForUser);
// routes/userInteractions.js

router.get('/history/:user_id', controller.getUserHistory);
router.get('/analytics/:article_id', controller.getArticleAnalytics);


module.exports = router;
