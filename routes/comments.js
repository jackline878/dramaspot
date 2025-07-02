const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const checkAuthMiddleware = require('../middlewares/check-auth');

router.post('/addComment', checkAuthMiddleware.check, commentController.addComment);
router.post('/replies', checkAuthMiddleware.isUser, commentController.fetchReplies);
router.post('/like', checkAuthMiddleware.check, commentController.toggleLike);

module.exports = router;
