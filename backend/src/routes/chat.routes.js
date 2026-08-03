const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/conversations', authenticate, chatController.getConversations);
router.get('/messages/:targetId', authenticate, chatController.getMessages);
router.post('/send', authenticate, chatController.sendMessage);
router.post('/messages', authenticate, chatController.sendMessage);
router.patch('/read/:targetId', authenticate, chatController.markRead);
router.get('/suggested-connections', authenticate, chatController.getSuggestedConnections);
router.post('/ai-intro', authenticate, chatController.generateAIIntro);

module.exports = router;
