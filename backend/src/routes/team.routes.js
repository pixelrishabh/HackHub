const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/match', authenticate, teamController.matchTeams);
router.get('/', authenticate, teamController.getAllTeams);
router.get('/:id', authenticate, teamController.getTeamById);
router.post('/:teamId/check-in', authenticate, teamController.checkInTeam);
router.get('/:teamId/engagement', authenticate, teamController.getTeamEngagement);

module.exports = router;
