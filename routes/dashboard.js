// routes/dashboard.js

const express = require('express');
const router = express.Router();
const controller = require('../dashboard');
const checkAuthMiddleware = require('../middlewares/check-auth').admin;
const { renderDashboard } = require('../render/dashboard');

// Dashboard stats
router.get('/stats', checkAuthMiddleware, controller.getDashboardStats);

// Traffic chart
router.get('/traffic-chart', checkAuthMiddleware, controller.getTrafficChart);

// Recent articles
router.get('/recent-articles', checkAuthMiddleware, controller.getRecentArticles);

// Recent comments
router.get('/recent-comments', checkAuthMiddleware, controller.getRecentComments);

// User activity
router.get('/user-activity', checkAuthMiddleware, controller.getUserActivity);

// Top authors
router.get('/top-authors', checkAuthMiddleware, controller.getTopAuthors);

// Article status progress
router.get('/article-status-progress', checkAuthMiddleware, controller.getArticleStatusProgress);

router.get('/dashboard', checkAuthMiddleware, controller.dashboard, renderDashboard);

module.exports = router;
