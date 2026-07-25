const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor.controller');
const { authenticate } = require('../middleware/auth.middleware');

// FEATURE 2: AI Mentor Assistant
router.post('/chat', authenticate, mentorController.chatWithMentor);
router.get('/history/:teamId', authenticate, mentorController.getChatHistory);

module.exports = router;
