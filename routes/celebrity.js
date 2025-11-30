const express = require('express');
const router = express.Router();
const celebrityController = require('../controllers/celebrity.controller');

router.post('/', celebrityController.create);
router.get('/', celebrityController.getAll);
router.get('/:slug', celebrityController.getBySlug);
router.put('/:slug', celebrityController.updateBySlug);
router.delete('/:slug', celebrityController.deleteBySlug);

module.exports = router;
