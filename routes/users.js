const express = require('express');
const userController = require('../controllers/user.controller');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const cookie = require('../middlewares/set_cookie.js');

router.post('/register', checkAuthMiddleware.isUser, upload.single('media'), userController.signUp, cookie.set);
router.get('/', checkAuthMiddleware.check, async (req, res) => {
    res.sendFile('user.html', { root: __dirname + '/../public' });
});
router.get('/settings', checkAuthMiddleware.check, async (req, res) => {
    res.sendFile('settings.html', { root: __dirname + '/../admin' });
});

router.get('/user', checkAuthMiddleware.check, userController.show);
router.get('/user/:id', checkAuthMiddleware.check, userController.findUser);
router.get('/users', checkAuthMiddleware.check, userController.all);
router.put('/updateRole', checkAuthMiddleware.check, userController.bulkUpdateUsers);
router.get('/team', userController.team);
router.delete('/delete', checkAuthMiddleware.isUser, userController.deleteAccount);
router.get('/be_admin', checkAuthMiddleware.isUser, userController.beAdmin);
router.get('/admin', checkAuthMiddleware.admin, userController.admin);
router.put('/update', checkAuthMiddleware.isUser,upload.single('media'), userController.update);
router.put('/update/password', checkAuthMiddleware.isUser, userController.changePassword);
router.post('/login', checkAuthMiddleware.isUser, userController.login, cookie.set);
router.post('/follow', checkAuthMiddleware.isUser, userController.toggleFollow);
router.post('/logout', checkAuthMiddleware.isUser, userController.logout);


module.exports = router;