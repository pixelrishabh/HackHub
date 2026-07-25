const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagement.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// FEATURE 6: Engagement Dashboard (Organizer/Judge view)
router.get('/dashboard', authenticate, authorize(['organizer', 'judge', 'mentor']), engagementController.getEngagementDashboard);

module.exports = router;
