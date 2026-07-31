const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const sponsorAuth = [authenticate, authorize(['sponsor', 'organizer', 'judge', 'mentor'])];

router.get('/projects', sponsorAuth, sponsorController.getSponsorProjects);
router.get('/talent', sponsorAuth, sponsorController.getSponsorTalent);
router.post('/bookmark', sponsorAuth, sponsorController.toggleBookmark);
router.get('/bookmarks', sponsorAuth, sponsorController.getSponsorBookmarks);

module.exports = router;
