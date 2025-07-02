const express = require('express');
const chatsController = require('../controllers/chat.controller');
const checkAuthMiddleware = require('../middlewares/check-auth');

const router = express.Router();

router.post("/send", checkAuthMiddleware.check, chatsController.send);
router.get("/all", checkAuthMiddleware.check, chatsController.getChatList);
router.get("/", checkAuthMiddleware.check, chatsController.index);
router.get("/inbox", checkAuthMiddleware.check, async(req, res) => {
    res.sendFile('messages.html', { root: __dirname + '/../public' });

});
router.get("/:id", checkAuthMiddleware.check, chatsController.show);
router.post("read", checkAuthMiddleware.check, chatsController.markAllFromSenderAsRead);
router.delete("/:id", checkAuthMiddleware.check, chatsController.destroy);
module.exports = router;