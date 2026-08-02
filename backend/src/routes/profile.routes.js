const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/me', authenticate, profileController.getProfile);
router.get('/contributions', authenticate, profileController.getContributions);
router.get('/streak', authenticate, profileController.getStreak);
router.get('/activity', authenticate, profileController.getActivity);
router.post('/activity', authenticate, profileController.postActivity);
router.put('/', authenticate, profileController.updateProfile);
router.get('/:userId', authenticate, profileController.getProfile);

module.exports = router;
