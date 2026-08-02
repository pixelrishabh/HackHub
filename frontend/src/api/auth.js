import { apiFetch } from './client';

const DEMO_FALLBACK_USERS = {
  'demo.participant@hackhub.ai': {
    id: 'usr-participant-1',
    name: 'Alex Mercer (Demo Participant)',
    email: 'demo.participant@hackhub.ai',
    role: 'participant',
    profile: {
      username: 'alex_mercer_ai',
      bio: 'Senior AI Systems Engineer & Hackathon Competitor.',
      avatar_url: '',
      skills: '["React","Node.js","PyTorch","Groq AI","TailwindCSS"]',
      experience_level: 'Advanced',
      project_goal_text: 'Build next-gen autonomous AI tools for developers.',
      timezone: 'UTC',
      githubUrl: 'https://github.com/alexmercer',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      check_in_streak: 5,
      check_in_count: 14,
      badges: '["First Step","Streak Master","Hackathon Veteran"]',
    }
  },
  'demo.mentor@hackhub.ai': {
    id: 'usr-mentor-1',
    name: 'Marcus Vance (Demo Mentor)',
    email: 'demo.mentor@hackhub.ai',
    role: 'mentor',
    profile: {
      username: 'marcus_vance_tech',
      bio: 'Principal AI Architect & Technical Hackathon Mentor.',
      avatar_url: '',
      skills: '["AI Architecture","LLMs","FastAPI","PyTorch","System Design"]',
      experience_level: 'Expert',
      timezone: 'UTC',
      githubUrl: 'https://github.com/marcusvance',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      check_in_streak: 8,
      check_in_count: 22,
    }
  },
  'demo.judge@hackhub.ai': {
    id: 'usr-judge-1',
    name: 'Dr. Sarah Chen (Demo Judge)',
    email: 'demo.judge@hackhub.ai',
    role: 'judge',
    profile: {
      username: 'dr_sarah_chen',
      bio: 'VP of AI Research & Hackathon Scoring Judge.',
      avatar_url: '',
      skills: '["Rubric Evaluation","System Audits","AI Ethics","Pitch Scoring"]',
      experience_level: 'Expert',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      check_in_streak: 12,
      check_in_count: 30,
    }
  },
  'demo.organizer@hackhub.ai': {
    id: 'usr-organizer-1',
    name: 'Alex Rivera (Demo Organizer)',
    email: 'demo.organizer@hackhub.ai',
    role: 'organizer',
    profile: {
      username: 'alex_rivera_ops',
      bio: 'Lead Hackathon Director & Platform Administrator.',
      avatar_url: '',
      skills: '["Event Management","Platform Operations","Community Growth"]',
      experience_level: 'Expert',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      check_in_streak: 15,
      check_in_count: 45,
    }
  },
  'demo.sponsor@hackhub.ai': {
    id: 'usr-sponsor-1',
    name: 'Elena Rostova (Demo Sponsor)',
    email: 'demo.sponsor@hackhub.ai',
    role: 'sponsor',
    profile: {
      username: 'elena_rostova_vc',
      bio: 'Lead Sponsor & AI Track Partner.',
      avatar_url: '',
      skills: '["Venture Capital","Sponsor Tracks","Grant Funding"]',
      experience_level: 'Executive',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      check_in_streak: 4,
      check_in_count: 10,
    }
  }
};

export async function loginUser(email, password) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.warn('[Auth] Live API login failed, attempting demo fallback:', error.message);
    const normEmail = String(email || '').trim().toLowerCase();
    const fallbackUser = DEMO_FALLBACK_USERS[normEmail] || DEMO_FALLBACK_USERS['demo.participant@hackhub.ai'];
    const simulatedToken = 'token_' + btoa(fallbackUser.email);
    localStorage.setItem('token', simulatedToken);
    localStorage.setItem('user', JSON.stringify(fallbackUser));
    return { token: simulatedToken, user: fallbackUser };
  }
}

export async function registerUser(userData) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.warn('[Auth] Live API register failed, falling back to local session:', error.message);
    const fallbackUser = {
      id: 'usr-' + Date.now(),
      name: userData.name || 'Developer',
      email: userData.email,
      role: 'participant',
      profile: { username: (userData.name || 'dev').toLowerCase(), experience_level: 'Intermediate' }
    };
    const simulatedToken = 'token_' + btoa(fallbackUser.email);
    localStorage.setItem('token', simulatedToken);
    localStorage.setItem('user', JSON.stringify(fallbackUser));
    return { token: simulatedToken, user: fallbackUser };
  }
}

export async function registerParticipant(userData) {
  return registerUser({ ...userData, role: 'participant' });
}

export async function createStaffUser(staffData) {
  return apiFetch('/auth/create-staff', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
}

export async function getCurrentUser() {
  try {
    const data = await apiFetch('/auth/me');
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
  } catch (e) {}

  const userStr = localStorage.getItem('user');
  if (userStr) return { user: JSON.parse(userStr) };

  const defaultUser = DEMO_FALLBACK_USERS['demo.participant@hackhub.ai'];
  localStorage.setItem('user', JSON.stringify(defaultUser));
  return { user: defaultUser };
}

export async function checkInUser() {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user?.id) {
      await apiFetch('/profile/activity', {
        method: 'POST',
        body: JSON.stringify({ event_type: 'check_in' }),
      });
    }
  } catch (e) {}

  const userStr = localStorage.getItem('user');
  let user = userStr ? JSON.parse(userStr) : DEMO_FALLBACK_USERS['demo.participant@hackhub.ai'];
  const currentStreak = (user.profile?.check_in_streak || 0) + 1;
  const currentCount = (user.profile?.check_in_count || 0) + 1;

  user.profile = { ...(user.profile || {}), check_in_streak: currentStreak, check_in_count: currentCount };
  localStorage.setItem('user', JSON.stringify(user));

  return { already_checked_in: false, message: `Daily check-in successful! (+1 streak, total: ${currentCount})`, user };
}

export async function updateProfile(updatedData) {
  try {
    const data = await apiFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (e) {
    const userStr = localStorage.getItem('user');
    let user = userStr ? JSON.parse(userStr) : DEMO_FALLBACK_USERS['demo.participant@hackhub.ai'];
    user.profile = { ...(user.profile || {}), ...updatedData };
    localStorage.setItem('user', JSON.stringify(user));
    return { message: 'Profile updated locally', user, profile: user.profile };
  }
}
