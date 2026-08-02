const Team = require('../models/Team');
const User = require('../models/User');
const EngagementEvent = require('../models/EngagementEvent');
const Submission = require('../models/Submission');
const { matchTeamsWithAI } = require('../services/ai.service');

async function matchTeams(req, res) {
  try {
    const { participants } = req.body;
    let participantList = participants;

    if (!participantList || !Array.isArray(participantList) || participantList.length === 0) {
      participantList = await User.find({ role: 'participant' }).limit(10);
    }

    const aiResult = await matchTeamsWithAI(participantList);
    return res.status(201).json({
      message: `Successfully formed ${aiResult.teams?.length || 1} balanced team(s) using AI.`,
      teams: aiResult.teams || [],
    });
  } catch (error) {
    console.error('[TeamController] matchTeams Error:', error);
    return res.status(500).json({ error: 'AI team matching failed.' });
  }
}

async function getAllTeams(req, res) {
  try {
    const teams = await Team.find().populate('members', 'name email role').sort({ createdAt: -1 });

    const formattedTeams = await Promise.all(
      teams.map(async (t) => {
        const teamObj = t.toJSON();
        const subs = await Submission.find({ teamId: t._id });
        teamObj.submissions = subs.map((s) => s.toJSON());
        return teamObj;
      })
    );

    return res.status(200).json({ teams: formattedTeams });
  } catch (error) {
    console.error('[TeamController] getAllTeams Error:', error);
    return res.status(500).json({ error: 'Failed to fetch teams.' });
  }
}

async function getTeamById(req, res) {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('members', 'name email role');
    if (!team) {
      return res.status(404).json({ error: `Team with ID '${id}' not found.` });
    }

    const subs = await Submission.find({ teamId: team._id });
    const teamObj = team.toJSON();
    teamObj.submissions = subs.map((s) => s.toJSON());

    return res.status(200).json({ team: teamObj });
  } catch (error) {
    console.error('[TeamController] getTeamById Error:', error);
    return res.status(500).json({ error: 'Failed to fetch team details.' });
  }
}

async function checkInTeam(req, res) {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    const event = await EngagementEvent.create({
      teamId: teamId || 'general',
      userId,
      eventType: 'check_in',
    });

    return res.status(201).json({
      message: 'Check-in recorded for team.',
      points_awarded: 5,
      event: event.toJSON(),
    });
  } catch (error) {
    console.error('[TeamController] checkInTeam Error:', error);
    return res.status(500).json({ error: 'Failed to record team check-in.' });
  }
}

async function getTeamEngagement(req, res) {
  try {
    const { teamId } = req.params;
    const events = await EngagementEvent.find({ teamId });

    let checkIns = 0;
    let chatMsgs = 0;
    let submissions = 0;

    events.forEach((ev) => {
      if (ev.eventType === 'check_in') checkIns++;
      if (ev.eventType === 'chat_message') chatMsgs++;
      if (ev.eventType.startsWith('submission')) submissions++;
    });

    const totalScore = checkIns * 5 + chatMsgs * 2 + submissions * 10;

    return res.status(200).json({
      team_id: teamId,
      total_score: totalScore,
      breakdown: {
        check_ins: checkIns,
        check_in_points: checkIns * 5,
        chat_messages: chatMsgs,
        chat_message_points: chatMsgs * 2,
        submissions_activity: submissions,
        submission_points: submissions * 10,
      },
    });
  } catch (error) {
    console.error('[TeamController] getTeamEngagement Error:', error);
    return res.status(500).json({ error: 'Failed to fetch team engagement.' });
  }
}

async function getEngagementDashboard(req, res) {
  try {
    const teams = await Team.find();

    const leaderboard = await Promise.all(
      teams.map(async (t) => {
        const events = await EngagementEvent.find({ teamId: t._id.toString() });
        const sub = await Submission.findOne({ teamId: t._id });

        let checkIns = 0;
        let chatMsgs = 0;
        let submissions = 0;

        events.forEach((ev) => {
          if (ev.eventType === 'check_in') checkIns++;
          if (ev.eventType === 'chat_message') chatMsgs++;
          if (ev.eventType.startsWith('submission')) submissions++;
        });

        const totalScore = checkIns * 5 + chatMsgs * 2 + submissions * 10 + (sub ? 15 : 0);

        return {
          team_id: t._id.toString(),
          team_name: t.name,
          total_score: totalScore,
          events_breakdown: {
            check_in: checkIns,
            chat_message: chatMsgs,
            submission_create: sub ? 1 : 0,
          },
          has_submitted: !!sub,
          submission_status: sub ? sub.status : 'IN_PROGRESS',
        };
      })
    );

    leaderboard.sort((a, b) => b.total_score - a.total_score);

    return res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('[TeamController] getEngagementDashboard Error:', error);
    return res.status(500).json({ error: 'Failed to fetch engagement leaderboard.' });
  }
}

module.exports = {
  matchTeams,
  getAllTeams,
  getTeamById,
  checkInTeam,
  getTeamEngagement,
  getEngagementDashboard,
};
