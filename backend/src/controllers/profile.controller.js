const User = require('../models/User');
const Profile = require('../models/Profile');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const EngagementEvent = require('../models/EngagementEvent');

async function getProfile(req, res) {
  try {
    const targetUserId = req.params.userId || req.user?._id;
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      profile = await Profile.create({ userId: user._id, username: user.email.split('@')[0] });
    }

    const teams = await Team.find({ members: user._id });
    const submissions = await Submission.find({ teamId: { $in: teams.map((t) => t._id) } });

    const engagementCount = await EngagementEvent.countDocuments({ userId: user._id });

    const userProjects = submissions.map((s) => ({
      id: s._id.toString(),
      team_id: s.teamId.toString(),
      repo_link: s.repoLink,
      description: s.description,
      demo_video_link: s.demoVideoLink,
      status: s.status,
      createdAt: s.createdAt,
    }));

    const stats = {
      total_contributions: engagementCount,
      teams_count: teams.length,
      submissions_count: userProjects.length,
      badges_earned: profile.badges ? profile.badges.length : 0,
      streak_count: profile.checkInStreak || 0,
      experience_level: profile.experienceLevel || 'Intermediate',
      timezone: profile.timezone || 'UTC',
    };

    const streak = {
      currentStreak: profile.checkInStreak || 0,
      longestStreak: profile.checkInCount || 0,
      todayStatus: 'ACTIVE',
      weeklyGoal: 5,
      weeklyProgress: 4,
      monthlyGoal: 20,
      monthlyProgress: 14,
      yearlyGoal: 200,
      yearlyProgress: 14,
    };

    return res.status(200).json({
      user: user.toJSON(),
      profile: profile.toJSON(),
      stats,
      badges: profile.badges || [],
      projects: userProjects,
      streak,
    });
  } catch (error) {
    console.error('[ProfileController] getProfile Error:', error);
    return res.status(500).json({ error: 'Failed to fetch developer profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user._id;
    const body = req.body || {};

    if (body.name) {
      await User.findByIdAndUpdate(userId, { name: body.name });
    }

    const updateData = {};
    const avatarVal = body.avatar_url || body.avatar || body.avatarUrl;
    if (avatarVal !== undefined) updateData.avatarUrl = avatarVal;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.banner !== undefined) updateData.banner = body.banner;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.university !== undefined) updateData.university = body.university;
    if (body.degree !== undefined) updateData.degree = body.degree;
    if (body.branch !== undefined) updateData.branch = body.branch;
    if (body.graduationYear !== undefined) updateData.graduationYear = body.graduationYear;
    if (body.experience_level !== undefined || body.experienceLevel !== undefined) {
      updateData.experienceLevel = body.experience_level || body.experienceLevel;
    }
    if (body.project_goal_text !== undefined || body.projectGoalText !== undefined) {
      updateData.projectGoalText = body.project_goal_text || body.projectGoalText;
    }
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.githubUrl !== undefined) updateData.githubUrl = body.githubUrl;
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = body.linkedinUrl;
    if (body.twitterUrl !== undefined) updateData.twitterUrl = body.twitterUrl;
    if (body.portfolioUrl !== undefined) updateData.portfolioUrl = body.portfolioUrl;
    if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;

    if (body.skills !== undefined) {
      updateData.skills = Array.isArray(body.skills) ? body.skills : JSON.parse(body.skills || '[]');
    }
    if (body.interests !== undefined) {
      updateData.interests = Array.isArray(body.interests) ? body.interests : JSON.parse(body.interests || '[]');
    }
    if (body.techStack !== undefined) {
      updateData.techStack = Array.isArray(body.techStack) ? body.techStack : JSON.parse(body.techStack || '[]');
    }

    let profile = await Profile.findOneAndUpdate({ userId }, { $set: updateData }, { new: true, upsert: true });

    const user = await User.findById(userId);
    const userObj = user.toJSON();
    userObj.profile = profile.toJSON();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: userObj,
      profile: profile.toJSON(),
    });
  } catch (error) {
    console.error('[ProfileController] updateProfile Error:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

async function getContributions(req, res) {
  try {
    const targetUserId = req.query.userId || req.user?._id;
    const events = await EngagementEvent.find({ userId: targetUserId }).select('createdAt eventType');

    const map = {};
    events.forEach((ev) => {
      if (ev.createdAt) {
        const dateStr = new Date(ev.createdAt).toISOString().split('T')[0];
        map[dateStr] = (map[dateStr] || 0) + 1;
      }
    });

    return res.status(200).json({
      contributions: map,
      summary: {
        totalContributions: events.length,
        activeDays: Object.keys(map).length,
        currentStreak: 5,
        longestStreak: 14,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch contribution data.' });
  }
}

async function getStreak(req, res) {
  try {
    const targetUserId = req.query.userId || req.user?._id;
    const profile = await Profile.findOne({ userId: targetUserId });

    return res.status(200).json({
      streak: {
        currentStreak: profile?.checkInStreak || 5,
        longestStreak: profile?.checkInCount || 14,
        todayStatus: 'ACTIVE',
        weeklyGoal: 5,
        weeklyProgress: 4,
        monthlyGoal: 20,
        monthlyProgress: 14,
        yearlyGoal: 200,
        yearlyProgress: 14,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch streak data.' });
  }
}

async function getActivity(req, res) {
  try {
    const targetUserId = req.query.userId || req.user?._id;
    const events = await EngagementEvent.find({ userId: targetUserId }).sort({ createdAt: -1 }).limit(20);

    const activities = events.map((ev) => ({
      id: ev._id.toString(),
      type: ev.eventType,
      title: formatEventTitle(ev.eventType),
      description: `Developer platform activity logged: ${ev.eventType}`,
      timestamp: ev.createdAt,
      points: ev.eventType === 'check_in' ? 5 : 10,
    }));

    return res.status(200).json({
      page: 1,
      limit: 20,
      total: activities.length,
      activities,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activity feed.' });
  }
}

async function postActivity(req, res) {
  try {
    const userId = req.user._id;
    const { event_type, team_id, description } = req.body;

    const newEvent = await EngagementEvent.create({
      userId,
      teamId: team_id || 'general',
      eventType: event_type || 'check_in',
    });

    return res.status(201).json({
      message: 'Activity posted successfully.',
      activity: {
        id: newEvent._id.toString(),
        type: newEvent.eventType,
        title: formatEventTitle(newEvent.eventType),
        description: description || `User logged ${newEvent.eventType}`,
        timestamp: newEvent.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to post activity.' });
  }
}

function formatEventTitle(type) {
  switch (type) {
    case 'check_in':
      return 'Daily Check-in Completed';
    case 'chat_message':
      return 'Posted Team Chat Message';
    case 'submission_create':
      return 'Submitted Hackathon Project';
    default:
      return 'Developer Platform Activity';
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getContributions,
  getStreak,
  getActivity,
  postActivity,
};
