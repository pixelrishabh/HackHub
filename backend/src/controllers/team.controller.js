const prisma = require('../config/db');
const { matchTeamsWithAI } = require('../services/ai.service');

/**
 * FEATURE 1 — AI Skill-Based Team Formation
 * Endpoint: POST /api/teams/match
 */
async function matchTeams(req, res) {
  try {
    let { participants } = req.body;

    // If no participants array provided in request, load unmatched participant profiles from DB
    if (!Array.isArray(participants) || participants.length === 0) {
      // Find participants who are not yet assigned to any team member_ids list
      const existingTeams = await prisma.team.findMany();
      const matchedUserIds = new Set();
      existingTeams.forEach(t => {
        try {
          const ids = JSON.parse(t.member_ids || '[]');
          ids.forEach(id => matchedUserIds.add(id));
        } catch (e) {}
      });

      const participantUsers = await prisma.user.findMany({
        where: { role: 'participant' },
        include: { profile: true },
      });

      // Filter out participants already in a team
      participants = participantUsers
        .filter(u => !matchedUserIds.has(u.id))
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          skills: u.profile?.skills ? JSON.parse(u.profile.skills) : [],
          experience_level: u.profile?.experience_level || 'Intermediate',
          interests: u.profile?.interests ? JSON.parse(u.profile.interests) : [],
          project_goal_text: u.profile?.project_goal_text || '',
        }));
    } else {
      // Filter out participants who already belong to an active team
      const existingTeams = await prisma.team.findMany();
      const matchedUserIds = new Set();
      existingTeams.forEach(t => {
        try {
          const ids = JSON.parse(t.member_ids || '[]');
          ids.forEach(id => matchedUserIds.add(id));
        } catch (e) {}
      });

      participants = participants.filter(p => !matchedUserIds.has(p.id || p.user_id));
    }

    if (participants.length === 0) {
      return res.status(200).json({
        message: 'No unmatched participants available for team formation.',
        created_teams: [],
      });
    }

    // Pass profiles to LLM
    const aiResult = await matchTeamsWithAI(participants);
    const createdTeams = [];

    // Create Team records in DB
    if (aiResult && Array.isArray(aiResult.teams)) {
      for (const t of aiResult.teams) {
        const teamName = t.name || `HackHub Team ${Math.floor(100 + Math.random() * 900)}`;
        const memberIds = Array.isArray(t.member_ids) ? t.member_ids : [];
        const rationale = t.rationale || t.match_rationale_text || 'AI-formed balanced team.';

        if (memberIds.length > 0) {
          const newTeam = await prisma.team.create({
            data: {
              name: teamName,
              member_ids: JSON.stringify(memberIds),
              match_rationale_text: rationale,
            },
          });
          createdTeams.push({
            ...newTeam,
            member_ids: memberIds,
          });
        }
      }
    }

    return res.status(201).json({
      message: `Successfully formed ${createdTeams.length} balanced team(s) using AI.`,
      unmatched_count_processed: participants.length,
      teams: createdTeams,
    });
  } catch (error) {
    console.error('[TeamController] matchTeams Error:', error);
    return res.status(500).json({ error: 'Team matchmaking failed. Please try again.' });
  }
}

/**
 * List Teams with member profile details (Scoped for participants)
 */
async function getAllTeams(req, res) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        submissions: true,
        engagementEvents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let populatedTeams = await Promise.all(teams.map(async (t) => {
      let memberIds = [];
      try { memberIds = JSON.parse(t.member_ids || '[]'); } catch (e) {}
      
      const members = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true, email: true, role: true, profile: true },
      });

      return {
        ...t,
        member_ids: memberIds,
        members,
      };
    }));

    // Data Scoping: Participants see only their own team, staff sees all
    const userRole = (req.user?.role || '').toLowerCase();
    const isStaff = ['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole);
    if (!isStaff && req.user) {
      let userTeams = populatedTeams.filter(t => Array.isArray(t.member_ids) && t.member_ids.includes(req.user.id));
      if (userTeams.length === 0) {
        const newTeam = await prisma.team.create({
          data: {
            name: `${req.user.name}'s Team`,
            member_ids: JSON.stringify([req.user.id]),
            match_rationale_text: 'Participant workspace team.',
          },
        });
        userTeams = [{
          ...newTeam,
          member_ids: [req.user.id],
          members: [{ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role }],
          submissions: [],
          engagementEvents: [],
        }];
      }
      populatedTeams = userTeams;
    }

    return res.status(200).json({ teams: populatedTeams });
  } catch (error) {
    console.error('[TeamController] getAllTeams Error:', error);
    return res.status(500).json({ error: 'Failed to fetch teams.' });
  }
}

/**
 * Get Team by ID with details (IDOR Protected)
 */
async function getTeamById(req, res) {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        submissions: { include: { evaluations: true } },
        engagementEvents: true,
        mentorMessages: { orderBy: { timestamp: 'asc' } },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    // IDOR Protection: Staff or team member only
    const userRole = (req.user?.role || '').toLowerCase();
    const isStaff = ['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole);
    if (!isStaff && req.user && !memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to view this team.' });
    }

    const members = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, email: true, role: true, profile: true },
    });

    return res.status(200).json({
      team: {
        ...team,
        member_ids: memberIds,
        members,
      },
    });
  } catch (error) {
    console.error('[TeamController] getTeamById Error:', error);
    return res.status(500).json({ error: 'Failed to fetch team details.' });
  }
}

module.exports = {
  matchTeams,
  getAllTeams,
  getTeamById,
};

