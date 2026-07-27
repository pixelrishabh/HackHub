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

// NEW TEAM MANAGEMENT ENDPOINTS
router.post('/create', authenticate, teamController.createTeam);
router.get('/browse', authenticate, teamController.browseTeams);
router.post('/:id/join-request', authenticate, teamController.createJoinRequest);
router.delete('/:id/join-request', authenticate, teamController.cancelJoinRequest);
router.post('/:id/join-request/:requestId/accept', authenticate, teamController.acceptJoinRequest);
router.post('/:id/join-request/:requestId/reject', authenticate, teamController.rejectJoinRequest);
router.post('/:id/leave', authenticate, teamController.leaveTeam);
router.post('/:id/add-member', authenticate, teamController.addTeamMember);
router.get('/:id/requests', authenticate, teamController.getTeamRequests);
router.get('/:id/compatibility', authenticate, teamController.getTeamCompatibility);
router.get('/:id/dashboard', authenticate, teamController.getTeamDashboardDetailed);

// Existing Team endpoints
router.get('/', authenticate, teamController.getAllTeams);
router.get('/:id', authenticate, teamController.getTeamById);

module.exports = router;
