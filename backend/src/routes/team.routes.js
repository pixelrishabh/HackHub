const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const engagementController = require('../controllers/engagement.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// FEATURE 1: AI Skill-Based Team Formation (Organizer / Admin)
router.post('/match', authenticate, authorize(['organizer']), teamController.matchTeams);

// FEATURE 6: Team Engagement & Check-in
router.post('/:id/check-in', authenticate, engagementController.checkInTeam);
router.get('/:id/engagement', authenticate, engagementController.getTeamEngagement);

// Team endpoints
router.get('/', authenticate, teamController.getAllTeams);
router.get('/:id', authenticate, teamController.getTeamById);

module.exports = router;
