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

/**
 * Helper to check if a user is currently a member of any active team
 */
async function getUserActiveTeam(userId) {
  const allTeams = await prisma.team.findMany();
  for (const t of allTeams) {
    let memberIds = [];
    try { memberIds = JSON.parse(t.member_ids || '[]'); } catch (e) {}
    if (memberIds.includes(userId) || t.leader_id === userId) {
      return t;
    }
  }
  return null;
}

/**
 * POST /api/teams/create
 * Participant creates a new team, automatically becoming leader & first member.
 */
async function createTeam(req, res) {
  try {
    const { name, description, logo_url, category, max_members, required_skills, tech_stack } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    // Validate user is not already in an active team
    const existingTeam = await getUserActiveTeam(userId);
    if (existingTeam) {
      return res.status(400).json({ 
        error: `You are already a member of team "${existingTeam.name}". Leave your current team before creating a new one.` 
      });
    }

    const reqSkillsArr = Array.isArray(required_skills) ? required_skills : (typeof required_skills === 'string' ? JSON.parse(required_skills || '[]') : []);
    const techStackArr = Array.isArray(tech_stack) ? tech_stack : (typeof tech_stack === 'string' ? JSON.parse(tech_stack || '[]') : []);

    const newTeam = await prisma.team.create({
      data: {
        name: name.trim(),
        leader_id: userId,
        description: (description || '').trim(),
        logo_url: (logo_url || '').trim(),
        category: category || 'Web Dev',
        max_members: Number(max_members) || 4,
        required_skills: JSON.stringify(reqSkillsArr),
        tech_stack: JSON.stringify(techStackArr),
        member_ids: JSON.stringify([userId]),
        match_rationale_text: 'User-created custom team.',
      },
    });

    return res.status(201).json({
      message: 'Team created successfully!',
      team: {
        ...newTeam,
        member_ids: [userId],
        required_skills: reqSkillsArr,
        tech_stack: techStackArr,
      },
    });
  } catch (error) {
    console.error('[TeamController] createTeam Error:', error);
    return res.status(500).json({ error: 'Failed to create team.' });
  }
}

/**
 * GET /api/teams/browse
 * Returns all non-full teams with computed capacity indicators and optional filters
 */
async function browseTeams(req, res) {
  try {
    const { category, skills, tech_stack, experience_level } = req.query;

    const allTeams = await prisma.team.findMany({
      include: {
        joinRequests: {
          where: { status: 'pending' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const populated = await Promise.all(allTeams.map(async (team) => {
      let memberIds = [];
      try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

      let reqSkills = [];
      try { reqSkills = JSON.parse(team.required_skills || '[]'); } catch (e) {}

      let techStack = [];
      try { techStack = JSON.parse(team.tech_stack || '[]'); } catch (e) {}

      const currentCount = memberIds.length;
      const maxMembers = team.max_members || 4;
      const availableSlots = Math.max(0, maxMembers - currentCount);

      // Load members & leader details
      const members = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true, email: true, role: true, profile: true },
      });

      const leader = members.find(m => m.id === team.leader_id) || members[0] || null;

      return {
        ...team,
        member_ids: memberIds,
        required_skills: reqSkills,
        tech_stack: techStack,
        current_member_count: currentCount,
        available_slots: availableSlots,
        is_full: currentCount >= maxMembers,
        leader_name: leader ? leader.name : 'Unassigned',
        members,
      };
    }));

    // Filter out full teams and apply search parameters
    let filtered = populated.filter(t => !t.is_full);

    if (category && category !== 'All') {
      filtered = filtered.filter(t => (t.category || '').toLowerCase() === category.toLowerCase());
    }

    if (skills) {
      const searchSkill = skills.toLowerCase();
      filtered = filtered.filter(t => t.required_skills.some(s => s.toLowerCase().includes(searchSkill)));
    }

    if (tech_stack) {
      const searchTech = tech_stack.toLowerCase();
      filtered = filtered.filter(t => t.tech_stack.some(s => s.toLowerCase().includes(searchTech)));
    }

    if (experience_level) {
      filtered = filtered.filter(t => t.members.some(m => m.profile?.experience_level?.toLowerCase() === experience_level.toLowerCase()));
    }

    return res.status(200).json({ teams: filtered });
  } catch (error) {
    console.error('[TeamController] browseTeams Error:', error);
    return res.status(500).json({ error: 'Failed to browse teams.' });
  }
}

/**
 * POST /api/teams/:id/join-request
 * Participant requests to join a team
 */
async function createJoinRequest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    // 1. Capacity check
    if (memberIds.length >= (team.max_members || 4)) {
      return res.status(400).json({ error: 'Team is already at maximum capacity.' });
    }

    // 2. Check if user already belongs to a team
    const activeTeam = await getUserActiveTeam(userId);
    if (activeTeam) {
      return res.status(400).json({ 
        error: `You are already a member of team "${activeTeam.name}". Leave your current team first.` 
      });
    }

    // 3. Check duplicate pending/accepted request
    const existingReq = await prisma.joinRequest.findFirst({
      where: {
        team_id: id,
        user_id: userId,
        status: { in: ['pending', 'accepted'] },
      },
    });

    if (existingReq) {
      return res.status(400).json({ error: 'You already have an active or pending join request for this team.' });
    }

    const joinReq = await prisma.joinRequest.create({
      data: {
        team_id: id,
        user_id: userId,
        status: 'pending',
      },
    });

    return res.status(201).json({
      message: 'Join request submitted successfully!',
      request: joinReq,
    });
  } catch (error) {
    console.error('[TeamController] createJoinRequest Error:', error);
    return res.status(500).json({ error: 'Failed to submit join request.' });
  }
}

/**
 * DELETE /api/teams/:id/join-request
 * Cancel user's own pending join request
 */
async function cancelJoinRequest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const pendingReq = await prisma.joinRequest.findFirst({
      where: {
        team_id: id,
        user_id: userId,
        status: 'pending',
      },
    });

    if (!pendingReq) {
      return res.status(404).json({ error: 'No pending join request found to cancel.' });
    }

    await prisma.joinRequest.update({
      where: { id: pendingReq.id },
      data: { status: 'cancelled' },
    });

    return res.status(200).json({ message: 'Join request cancelled.' });
  } catch (error) {
    console.error('[TeamController] cancelJoinRequest Error:', error);
    return res.status(500).json({ error: 'Failed to cancel join request.' });
  }
}

/**
 * POST /api/teams/:id/join-request/:requestId/accept
 * Leader accepts a join request & adds user to team
 */
async function acceptJoinRequest(req, res) {
  try {
    const { id, requestId } = req.params;
    const userId = req.user.id;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    // Leader verification: req.user.id must match leader_id or first member
    const isLeader = team.leader_id ? (team.leader_id === userId) : (memberIds[0] === userId);
    if (!isLeader) {
      return res.status(403).json({ error: 'Forbidden. Only the team leader can accept join requests.' });
    }

    // Capacity re-check at moment of acceptance
    if (memberIds.length >= (team.max_members || 4)) {
      return res.status(400).json({ error: 'Team has reached maximum capacity.' });
    }

    const joinReq = await prisma.joinRequest.findUnique({ where: { id: requestId } });
    if (!joinReq || joinReq.team_id !== id || joinReq.status !== 'pending') {
      return res.status(404).json({ error: 'Pending join request not found.' });
    }

    // Add applicant to member_ids if not present
    if (!memberIds.includes(joinReq.user_id)) {
      memberIds.push(joinReq.user_id);
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: { member_ids: JSON.stringify(memberIds) },
    });

    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    return res.status(200).json({
      message: 'Join request accepted! Member added to team.',
      team: {
        ...updatedTeam,
        member_ids: memberIds,
      },
    });
  } catch (error) {
    console.error('[TeamController] acceptJoinRequest Error:', error);
    return res.status(500).json({ error: 'Failed to accept join request.' });
  }
}

/**
 * POST /api/teams/:id/join-request/:requestId/reject
 * Leader rejects a join request
 */
async function rejectJoinRequest(req, res) {
  try {
    const { id, requestId } = req.params;
    const userId = req.user.id;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    const isLeader = team.leader_id ? (team.leader_id === userId) : (memberIds[0] === userId);
    if (!isLeader) {
      return res.status(403).json({ error: 'Forbidden. Only the team leader can reject join requests.' });
    }

    const joinReq = await prisma.joinRequest.findUnique({ where: { id: requestId } });
    if (!joinReq || joinReq.team_id !== id) {
      return res.status(404).json({ error: 'Join request not found.' });
    }

    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
    });

    return res.status(200).json({ message: 'Join request rejected.' });
  } catch (error) {
    console.error('[TeamController] rejectJoinRequest Error:', error);
    return res.status(500).json({ error: 'Failed to reject join request.' });
  }
}

/**
 * POST /api/teams/:id/leave
 * Member leaves team; blocks leader if other members exist
 */
async function leaveTeam(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    if (!memberIds.includes(userId)) {
      return res.status(400).json({ error: 'You are not a member of this team.' });
    }

    const isLeader = team.leader_id === userId || memberIds[0] === userId;

    // If leader attempts to leave and other members exist, block action
    if (isLeader && memberIds.length > 1) {
      return res.status(400).json({ 
        error: 'Leader cannot leave the team without transferring leadership first or disbanding the team.' 
      });
    }

    const updatedMemberIds = memberIds.filter(m => m !== userId);

    await prisma.team.update({
      where: { id },
      data: {
        member_ids: JSON.stringify(updatedMemberIds),
        leader_id: isLeader ? null : team.leader_id,
      },
    });

    return res.status(200).json({ message: 'Successfully left the team.' });
  } catch (error) {
    console.error('[TeamController] leaveTeam Error:', error);
    return res.status(500).json({ error: 'Failed to leave team.' });
  }
}

/**
 * GET /api/teams/:id/requests
 * Leader views pending join requests with requester Profile info
 */
async function getTeamRequests(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    const isLeader = team.leader_id ? (team.leader_id === userId) : (memberIds[0] === userId);
    const userRole = (req.user?.role || '').toLowerCase();
    const isStaff = ['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole);

    if (!isLeader && !isStaff) {
      return res.status(403).json({ error: 'Forbidden. Only the team leader can view join requests.' });
    }

    const requests = await prisma.joinRequest.findMany({
      where: { team_id: id, status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error('[TeamController] getTeamRequests Error:', error);
    return res.status(500).json({ error: 'Failed to fetch team requests.' });
  }
}

/**
 * GET /api/teams/:id/compatibility
 * Calculates AI compatibility between viewing user & team
 */
async function getTeamCompatibility(req, res) {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id } });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const userProfile = await prisma.profile.findUnique({
      where: { user_id: req.user.id },
    });

    const { calculateTeamCompatibilityWithAI } = require('../services/ai.service');
    const result = await calculateTeamCompatibilityWithAI({ userProfile, team });

    return res.status(200).json({ compatibility: result });
  } catch (error) {
    console.error('[TeamController] getTeamCompatibility Error:', error);
    return res.status(500).json({ error: 'Failed to compute compatibility.' });
  }
}

/**
 * GET /api/teams/:id/dashboard
 * Detailed Team Dashboard view for existing members
 */
async function getTeamDashboardDetailed(req, res) {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        submissions: { include: { evaluations: true } },
        engagementEvents: { orderBy: { timestamp: 'desc' } },
        mentorMessages: { orderBy: { timestamp: 'asc' } },
        joinRequests: {
          where: { status: 'pending' },
          include: { user: { select: { id: true, name: true, email: true, profile: true } } },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    const userRole = (req.user?.role || '').toLowerCase();
    const isStaff = ['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole);
    if (!isStaff && req.user && !memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied. Only team members can view the team dashboard.' });
    }

    const members = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, email: true, role: true, profile: true },
    });

    const isLeader = team.leader_id === req.user.id || memberIds[0] === req.user.id;

    return res.status(200).json({
      team: {
        ...team,
        member_ids: memberIds,
        members: members.map(m => ({
          ...m,
          is_leader: m.id === team.leader_id || m.id === memberIds[0],
        })),
        is_current_user_leader: isLeader,
      },
    });
  } catch (error) {
    console.error('[TeamController] getTeamDashboardDetailed Error:', error);
    return res.status(500).json({ error: 'Failed to fetch team dashboard.' });
  }
}

/**
 * POST /api/teams/:id/add-member
 * Leader directly adds a member by email or username
 */
async function addTeamMember(req, res) {
  try {
    const { id } = req.params;
    const { emailOrUsername, email, username } = req.body;
    const targetQuery = (emailOrUsername || email || username || '').trim();
    const currentUserId = req.user.id;

    if (!targetQuery) {
      return res.status(400).json({ error: 'Email or username is required.' });
    }

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    let memberIds = [];
    try { memberIds = JSON.parse(team.member_ids || '[]'); } catch (e) {}

    // Leader verification
    const isLeader = team.leader_id ? (team.leader_id === currentUserId) : (memberIds[0] === currentUserId);
    if (!isLeader) {
      return res.status(403).json({ error: 'Forbidden. Only the team leader can add members directly.' });
    }

    // Capacity check
    if (memberIds.length >= (team.max_members || 4)) {
      return res.status(400).json({ error: 'Team is already at maximum capacity.' });
    }

    // Lookup target user by email or name
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: targetQuery } },
          { name: { equals: targetQuery } },
        ],
      },
      select: { id: true, name: true, email: true, role: true, profile: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: `User "${targetQuery}" not found. Please verify the email or username.` });
    }

    // Check if target user is already in this team
    if (memberIds.includes(targetUser.id)) {
      return res.status(400).json({ error: `User "${targetUser.name}" is already a member of this team.` });
    }

    // Check if target user belongs to another active team
    const activeTeam = await getUserActiveTeam(targetUser.id);
    if (activeTeam) {
      return res.status(400).json({ 
        error: `User "${targetUser.name}" is already a member of team "${activeTeam.name}".` 
      });
    }

    // Add target user to member_ids
    memberIds.push(targetUser.id);

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: { member_ids: JSON.stringify(memberIds) },
    });

    return res.status(200).json({
      message: `Successfully added ${targetUser.name} to the team!`,
      team: {
        ...updatedTeam,
        member_ids: memberIds,
      },
      added_user: targetUser,
    });
  } catch (error) {
    console.error('[TeamController] addTeamMember Error:', error);
    return res.status(500).json({ error: 'Failed to add team member.' });
  }
}

module.exports = {
  matchTeams,
  getAllTeams,
  getTeamById,
  createTeam,
  browseTeams,
  createJoinRequest,
  cancelJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  leaveTeam,
  getTeamRequests,
  getTeamCompatibility,
  getTeamDashboardDetailed,
  addTeamMember,
};

