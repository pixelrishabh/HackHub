const prisma = require('../config/db');

/**
 * GET /api/profile/me (or GET /api/profile/:userId)
 * Fetch complete developer profile details including stats, badges, projects, and streak.
 */
async function getProfile(req, res) {
  try {
    const targetUserId = req.params.userId || req.user?.id;
    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Fetch user's team memberships
    const allTeams = await prisma.team.findMany({
      take: 100,
      select: {
        id: true,
        name: true,
        leader_id: true,
        category: true,
        member_ids: true,
        submissions: {
          select: {
            id: true,
            repo_link: true,
            description: true,
            demo_video_link: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const userTeams = allTeams.filter((t) => {
      try {
        const ids = JSON.parse(t.member_ids || '[]');
        return Array.isArray(ids) && ids.includes(targetUserId);
      } catch (e) {
        return false;
      }
    });

    // Gather projects from team submissions
    const userProjects = userTeams.flatMap((t) =>
      (t.submissions || []).map((s) => ({
        id: s.id,
        team_id: t.id,
        team_name: t.name,
        category: t.category,
        repo_link: s.repo_link,
        description: s.description,
        demo_video_link: s.demo_video_link,
        status: s.status,
        createdAt: s.createdAt,
      }))
    );

    // Compute Engagement & Contribution Events Count
    const engagementCount = await prisma.engagementEvent.count({
      where: { user_id: targetUserId },
    });

    // Badges array
    let badges = [];
    try {
      badges = JSON.parse(user.profile?.badges || '[]');
    } catch (e) {
      badges = [];
    }

    // Calculate streak stats
    const now = new Date();
    const lastCheckIn = user.profile?.last_check_in_at ? new Date(user.profile.last_check_in_at) : null;
    const isCheckedInToday = !!(
      lastCheckIn &&
      lastCheckIn.getUTCFullYear() === now.getUTCFullYear() &&
      lastCheckIn.getUTCMonth() === now.getUTCMonth() &&
      lastCheckIn.getUTCDate() === now.getUTCDate()
    );

    const streak = {
      currentStreak: user.profile?.check_in_streak || 0,
      longestStreak: user.profile?.check_in_count || 0,
      todayStatus: isCheckedInToday ? 'ACTIVE' : 'PENDING',
      weeklyGoal: 5,
      weeklyProgress: Math.min(5, (user.profile?.check_in_streak || 0) % 7 || (isCheckedInToday ? 1 : 0)),
      monthlyGoal: 20,
      monthlyProgress: Math.min(20, (user.profile?.check_in_count || 0) % 30),
      yearlyGoal: 200,
      yearlyProgress: Math.min(200, user.profile?.check_in_count || 0),
    };

    // Consolidated developer stats
    const stats = {
      total_contributions: engagementCount,
      teams_count: userTeams.length,
      submissions_count: userProjects.length,
      badges_earned: badges.length,
      streak_count: user.profile?.check_in_streak || 0,
      experience_level: user.profile?.experience_level || 'Intermediate',
      timezone: user.profile?.timezone || 'UTC',
    };

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: user.profile || {},
      stats,
      badges,
      projects: userProjects,
      streak,
    });
  } catch (error) {
    console.error('[ProfileController] getProfile Error:', error);
    return res.status(500).json({ error: 'Failed to fetch developer profile.' });
  }
}

/**
 * GET /api/profile/contributions
 * Fetch 365-day contribution heatmap data and summary metrics.
 */
async function getContributions(req, res) {
  try {
    const targetUserId = req.query.userId || req.user?.id;
    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const events = await prisma.engagementEvent.findMany({
      where: { user_id: targetUserId },
      select: { timestamp: true, event_type: true },
      take: 500,
      orderBy: { timestamp: 'desc' },
    });

    const contributionsMap = {};
    events.forEach((ev) => {
      if (ev.timestamp) {
        const dateStr = new Date(ev.timestamp).toISOString().split('T')[0];
        contributionsMap[dateStr] = (contributionsMap[dateStr] || 0) + 1;
      }
    });

    const activeDays = Object.keys(contributionsMap).length;
    const totalContributions = events.length;

    const profile = await prisma.profile.findUnique({
      where: { user_id: targetUserId },
      select: { check_in_streak: true, check_in_count: true },
    });

    return res.status(200).json({
      contributions: contributionsMap,
      summary: {
        totalContributions,
        activeDays,
        currentStreak: profile?.check_in_streak || 0,
        longestStreak: profile?.check_in_count || 0,
      },
    });
  } catch (error) {
    console.error('[ProfileController] getContributions Error:', error);
    return res.status(500).json({ error: 'Failed to fetch contribution data.' });
  }
}

/**
 * GET /api/profile/streak
 * Fetch user's streak counters & goal tracking metrics.
 */
async function getStreak(req, res) {
  try {
    const targetUserId = req.query.userId || req.user?.id;
    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const profile = await prisma.profile.findUnique({
      where: { user_id: targetUserId },
    });

    const now = new Date();
    const lastCheckIn = profile?.last_check_in_at ? new Date(profile.last_check_in_at) : null;
    const isCheckedInToday = !!(
      lastCheckIn &&
      lastCheckIn.getUTCFullYear() === now.getUTCFullYear() &&
      lastCheckIn.getUTCMonth() === now.getUTCMonth() &&
      lastCheckIn.getUTCDate() === now.getUTCDate()
    );

    const currentStreak = profile?.check_in_streak || 0;
    const longestStreak = profile?.check_in_count || 0;

    return res.status(200).json({
      streak: {
        currentStreak,
        longestStreak,
        todayStatus: isCheckedInToday ? 'ACTIVE' : 'PENDING',
        weeklyGoal: 5,
        weeklyProgress: Math.min(5, currentStreak % 7 || (isCheckedInToday ? 1 : 0)),
        monthlyGoal: 20,
        monthlyProgress: Math.min(20, longestStreak % 30),
        yearlyGoal: 200,
        yearlyProgress: Math.min(200, longestStreak),
      },
    });
  } catch (error) {
    console.error('[ProfileController] getStreak Error:', error);
    return res.status(500).json({ error: 'Failed to fetch streak data.' });
  }
}

/**
 * GET /api/profile/activity
 * Fetch GitHub-style activity timeline for the user.
 */
async function getActivity(req, res) {
  try {
    const targetUserId = req.query.userId || req.user?.id;
    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const events = await prisma.engagementEvent.findMany({
      where: { user_id: targetUserId },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    });

    const activities = events.map((ev) => ({
      id: ev.id,
      type: ev.event_type,
      title: formatEventTitle(ev.event_type),
      description: `Activity logged: ${ev.event_type} on team ID ${ev.team_id}`,
      timestamp: ev.timestamp,
      points: ev.event_type === 'check_in' ? 5 : (ev.event_type === 'submission_create' ? 25 : 10),
    }));

    return res.status(200).json({
      page,
      limit,
      total: activities.length,
      activities,
    });
  } catch (error) {
    console.error('[ProfileController] getActivity Error:', error);
    return res.status(500).json({ error: 'Failed to fetch activity feed.' });
  }
}

/**
 * POST /api/profile/activity
 * Post user activity event.
 */
async function postActivity(req, res) {
  try {
    const userId = req.user?.id;
    const { event_type, team_id, description } = req.body;

    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required.' });
    }

    const newEvent = await prisma.engagementEvent.create({
      data: {
        user_id: userId,
        team_id: team_id || 'general',
        event_type,
      },
    });

    return res.status(201).json({
      message: 'Activity posted successfully.',
      activity: {
        id: newEvent.id,
        type: newEvent.event_type,
        title: formatEventTitle(newEvent.event_type),
        description: description || `User logged ${newEvent.event_type}`,
        timestamp: newEvent.timestamp,
      },
    });
  } catch (error) {
    console.error('[ProfileController] postActivity Error:', error);
    return res.status(500).json({ error: 'Failed to post activity.' });
  }
}

/**
 * Helper: Format human readable activity title
 */
function formatEventTitle(type) {
  switch (type) {
    case 'check_in':
      return 'Daily Check-in Completed';
    case 'chat_message':
      return 'Posted Team Chat Message';
    case 'submission_create':
      return 'Submitted Hackathon Project';
    case 'submission_update':
      return 'Updated Hackathon Submission';
    default:
      return 'Developer Platform Activity';
  }
}

module.exports = {
  getProfile,
  getContributions,
  getStreak,
  getActivity,
  postActivity,
};
