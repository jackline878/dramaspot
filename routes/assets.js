const express = require('express');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const router = express.Router();



router.get('/assets/logo.png', async (req, res) => {
    res.sendFile('logo.png', { root: __dirname + '/../public' });
});
router.get('/assets/logo1.png', async (req, res) => {
    res.sendFile('logo5.png', { root: __dirname + '/../public' });
});
router.get('/assets/logo2.png', async (req, res) => {
    res.sendFile('logo6.png', { root: __dirname + '/../public' });
});
router.get('/assets/celebs.png', async (req, res) => {
    res.sendFile('celebs.png', { root: __dirname + '/../public' });
});
router.get('/assets/cover.png', async (req, res) => {
    res.sendFile('cover.png', { root: __dirname + '/../public' });
});
router.get('/privacy', async (req, res) => {
    res.sendFile('privacy.html', { root: __dirname + '/../public' });
});

router.get('/about', async (req, res) => {
    res.sendFile('about.html', { root: __dirname + '/../public' });
});

router.get('/contact', async (req, res) => {
    res.sendFile('contact.html', { root: __dirname + '/../public' });
});
router.get('/terms', async (req, res) => {
    res.sendFile('terms.html', { root: __dirname + '/../public' });
});

module.exports = router;