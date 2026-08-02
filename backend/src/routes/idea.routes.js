const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/idea.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/validate', authenticate, ideaController.validateIdea);

module.exports = router;
