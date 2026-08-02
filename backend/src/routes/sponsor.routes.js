const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/projects', authenticate, sponsorController.getProjects);
router.get('/talent', authenticate, sponsorController.getTalent);
router.post('/bookmark', authenticate, authorize(['sponsor', 'organizer']), sponsorController.addBookmark);
router.get('/bookmarks', authenticate, authorize(['sponsor', 'organizer']), sponsorController.getBookmarks);

module.exports = router;
