// Standalone Client-Side Profile Provider backed by localStorage
import { getCurrentUser, updateProfile as authUpdateProfile } from './auth';

export async function getProfile(userId) {
  const { user } = await getCurrentUser();
  const profile = user.profile || {};

  let skills = [];
  try {
    skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills || '[]') : (profile.skills || []);
  } catch (e) {
    skills = ['React', 'Node.js', 'AI'];
  }

  let badges = [];
  try {
    badges = typeof profile.badges === 'string' ? JSON.parse(profile.badges || '[]') : (profile.badges || []);
  } catch (e) {
    badges = ['First Step', 'Streak Master'];
  }

  const projects = [
    {
      id: 'proj-1',
      team_id: 'team-1',
      team_name: 'NeuralCrafters',
      category: 'AI / Machine Learning',
      repo_link: 'https://github.com/neuralcrafters/hackops-agent',
      description: 'Autonomous AI hackathon management platform with Groq LLM & RAG.',
      demo_video_link: 'https://youtube.com/watch?v=demo',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    }
  ];

  const streak = {
    currentStreak: profile.check_in_streak || 5,
    longestStreak: profile.check_in_count || 14,
    todayStatus: 'ACTIVE',
    weeklyGoal: 5,
    weeklyProgress: 4,
    monthlyGoal: 20,
    monthlyProgress: 14,
    yearlyGoal: 200,
    yearlyProgress: 14,
  };

  const stats = {
    total_contributions: 42,
    teams_count: 1,
    submissions_count: 1,
    badges_earned: badges.length,
    streak_count: profile.check_in_streak || 5,
    experience_level: profile.experience_level || 'Advanced',
    timezone: profile.timezone || 'UTC',
  };

  return {
    user,
    profile,
    stats,
    badges,
    projects,
    streak,
  };
}

export async function updateProfile(profileData) {
  return authUpdateProfile(profileData);
}

export async function getContributions(userId) {
  const map = {};
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (i % 2 === 0 || i % 3 === 0) {
      map[dateStr] = (i % 4) + 1;
    }
  }

  return {
    contributions: map,
    summary: {
      totalContributions: 42,
      activeDays: 28,
      currentStreak: 5,
      longestStreak: 14,
    },
  };
}

export async function getStreak(userId) {
  return {
    streak: {
      currentStreak: 5,
      longestStreak: 14,
      todayStatus: 'ACTIVE',
      weeklyGoal: 5,
      weeklyProgress: 4,
      monthlyGoal: 20,
      monthlyProgress: 14,
      yearlyGoal: 200,
      yearlyProgress: 14,
    },
  };
}

export async function getActivity(userId, page = 1, limit = 20) {
  const activities = [
    {
      id: 'act-1',
      type: 'check_in',
      title: 'Daily Check-in Completed',
      description: 'Logged daily progress streak (+5 pts)',
      timestamp: new Date().toISOString(),
      points: 5,
    },
    {
      id: 'act-2',
      type: 'chat_message',
      title: 'Posted Team Chat Message',
      description: 'Discussed Groq API integration in team chat',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      points: 2,
    },
    {
      id: 'act-3',
      type: 'submission_create',
      title: 'Submitted Hackathon Project',
      description: 'Submitted HackHub AI Autonomous OS for judging',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      points: 25,
    }
  ];

  return {
    page,
    limit,
    total: activities.length,
    activities,
  };
}

export async function postActivity(activityData) {
  return {
    message: 'Activity posted successfully.',
    activity: {
      id: 'act-' + Date.now(),
      type: activityData.event_type || 'check_in',
      title: 'Developer Activity',
      description: activityData.description || 'Logged platform progress',
      timestamp: new Date().toISOString(),
    },
  };
}
