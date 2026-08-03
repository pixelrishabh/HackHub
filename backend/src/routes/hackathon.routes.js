const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathon.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', hackathonController.getHackathons);
router.get('/:id', hackathonController.getHackathonById);

// Protected endpoints
router.post('/:id/register', authenticate, hackathonController.registerUserForHackathon);
router.post('/', authenticate, authorize('organizer'), hackathonController.createHackathon);

module.exports = router;
