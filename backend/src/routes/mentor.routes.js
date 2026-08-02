const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/chat', authenticate, mentorController.chat);
router.get('/history/:teamId', authenticate, mentorController.getHistory);
router.post('/review', authenticate, mentorController.review);
router.post('/upload', authenticate, mentorController.upload);

module.exports = router;
