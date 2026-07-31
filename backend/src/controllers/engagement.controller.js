const prisma = require('../config/db');

// Event Weights mapping
const EVENT_WEIGHTS = {
  check_in: 5,
  chat_message: 2,
  submission_create: 10,
  submission_update: 10,
};

function isUserAuthorizedForTeam(user, team) {
  if (!user) return false;
  const userRole = (user.role || '').toLowerCase();
  if (['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole)) {
    return true;
  }
  let memberIds = [];
  try {
    memberIds = JSON.parse(team?.member_ids || '[]');
  } catch (e) {}
  return Array.isArray(memberIds) && memberIds.includes(user.id);
}

/**
 * Log Team Check-in event
 * Endpoint: POST /api/teams/:id/check-in
 */
async function checkInTeam(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Team ID parameter is required.' });
    }

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: `Team with ID '${id}' not found.` });
    }

    // IDOR Protection: Staff or team member only
    if (!isUserAuthorizedForTeam(req.user, team)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to check-in for this team.' });
    }

    const event = await prisma.engagementEvent.create({
      data: {
        team_id: id,
        user_id: req.user?.id || null,
        event_type: 'check_in',
      },
    });

    return res.status(201).json({
      message: `Check-in recorded for team '${team.name}'. (+5 pts)`,
      event,
    });
  } catch (error) {
    console.error('[EngagementController] checkInTeam Error:', error);
    return res.status(500).json({ error: 'Check-in failed.' });
  }
}

/**
 * FEATURE 6 — Calculate Weighted Engagement Score for single team
 * Endpoint: GET /api/teams/:id/engagement
 */
async function getTeamEngagement(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Team ID parameter is required.' });
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: { engagementEvents: true },
    });

    if (!team) {
      return res.status(404).json({ error: `Team with ID '${id}' not found.` });
    }

    // IDOR Protection: Staff or team member only
    if (!isUserAuthorizedForTeam(req.user, team)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to view engagement details for this team.' });
    }

    const counts = {
      check_in: 0,
      chat_message: 0,
      submission_create: 0,
      submission_update: 0,
    };

    let totalScore = 0;

    (team.engagementEvents || []).forEach((ev) => {
      const type = (ev.event_type || '').toLowerCase();
      if (counts[type] !== undefined) {
        counts[type]++;
        totalScore += (EVENT_WEIGHTS[type] || 0);
      }
    });

    return res.status(200).json({
      team_id: team.id,
      team_name: team.name,
      total_engagement_score: totalScore,
      breakdown: {
        check_ins: counts.check_in,
        check_in_points: counts.check_in * EVENT_WEIGHTS.check_in,
        chat_messages: counts.chat_message,
        chat_message_points: counts.chat_message * EVENT_WEIGHTS.chat_message,
        submissions_activity: counts.submission_create + counts.submission_update,
        submission_points: (counts.submission_create + counts.submission_update) * 10,
      },
      total_events_logged: (team.engagementEvents || []).length,
    });
  } catch (error) {
    console.error('[EngagementController] getTeamEngagement Error:', error);
    return res.status(500).json({ error: 'Failed to calculate team engagement score.' });
  }
}

/**
 * FEATURE 6 — Live Organizer Engagement Dashboard
 * Endpoint: GET /api/engagement/dashboard
 */
async function getEngagementDashboard(req, res) {
  try {
    const teams = await prisma.team.findMany({
      take: 100,
      include: { engagementEvents: true, submissions: true },
    });

    const leaderboard = teams.map((team) => {
      const counts = { check_in: 0, chat_message: 0, submission_create: 0, submission_update: 0 };
      let totalScore = 0;

      (team.engagementEvents || []).forEach((ev) => {
        const type = (ev.event_type || '').toLowerCase();
        if (counts[type] !== undefined) {
          counts[type]++;
          totalScore += (EVENT_WEIGHTS[type] || 0);
        }
      });

      return {
        team_id: team.id,
        team_name: team.name,
        total_score: totalScore,
        events_breakdown: counts,
        has_submitted: Array.isArray(team.submissions) && team.submissions.length > 0,
        submission_status: team.submissions?.[0]?.status || 'NOT_SUBMITTED',
      };
    });

    // Sort descending by total score
    leaderboard.sort((a, b) => b.total_score - a.total_score);

    return res.status(200).json({
      message: 'Live Hackathon Engagement Leaderboard',
      total_teams: leaderboard.length,
      dashboard: leaderboard,
    });
  } catch (error) {
    console.error('[EngagementController] getEngagementDashboard Error:', error);
    return res.status(500).json({ error: 'Failed to fetch engagement dashboard.' });
  }
}

module.exports = {
  checkInTeam,
  getTeamEngagement,
  getEngagementDashboard,
};

