const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public Auth Endpoints (No Rate Limiting for smooth live judging & demo testing)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/create-staff', authenticate, authorize(['organizer']), authController.createStaff);
router.get('/me', authenticate, authController.getMe);
router.post('/check-in', authenticate, authController.checkInUser);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
