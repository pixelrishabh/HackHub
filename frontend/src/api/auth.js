// Standalone Client-Side Auth Provider backed by localStorage

const INITIAL_DEMO_USERS = {
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
      linkedinUrl: 'https://linkedin.com/in/alexmercer',
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

function getStorageUsers() {
  try {
    const raw = localStorage.getItem('hackhub_users');
    if (!raw) {
      localStorage.setItem('hackhub_users', JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DEMO_USERS;
  }
}

function saveStorageUsers(users) {
  try {
    localStorage.setItem('hackhub_users', JSON.stringify(users));
  } catch (e) {}
}

export async function loginUser(email, password) {
  const normEmail = String(email || '').trim().toLowerCase();
  const users = getStorageUsers();
  
  let targetUser = users[normEmail];
  
  // Fallback for aliases or missing user registration
  if (!targetUser) {
    const username = normEmail.split('@')[0] || 'developer';
    targetUser = {
      id: 'usr-' + Date.now(),
      name: username.replace(/[._]/g, ' ').toUpperCase(),
      email: normEmail,
      role: 'participant',
      profile: {
        username,
        bio: 'Hackathon Developer on HackHub AI Platform.',
        avatar_url: '',
        skills: '["React","Node.js","AI"]',
        experience_level: 'Intermediate',
        timezone: 'UTC',
        theme: 'deep-black-diamond',
        accentColor: '#00E5FF',
        check_in_streak: 1,
        check_in_count: 1,
      }
    };
    users[normEmail] = targetUser;
    saveStorageUsers(users);
  }

  const token = 'simulated_jwt_token_' + btoa(targetUser.email);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(targetUser));

  return {
    message: 'Login successful',
    token,
    user: targetUser,
  };
}

export async function registerUser(userData) {
  const normEmail = String(userData.email || '').trim().toLowerCase();
  const users = getStorageUsers();

  const newUser = {
    id: 'usr-' + Date.now(),
    name: userData.name || normEmail.split('@')[0],
    email: normEmail,
    role: userData.role || 'participant',
    profile: {
      username: (userData.name || '').toLowerCase().replace(/\s+/g, '_'),
      bio: 'Hackathon Developer on HackHub AI Platform.',
      avatar_url: '',
      skills: JSON.stringify(userData.skills || ['React', 'AI']),
      experience_level: userData.experience_level || 'Intermediate',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      check_in_streak: 1,
      check_in_count: 1,
    }
  };

  users[normEmail] = newUser;
  saveStorageUsers(users);

  const token = 'simulated_jwt_token_' + btoa(newUser.email);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(newUser));

  return {
    message: 'User registered successfully',
    token,
    user: newUser,
  };
}

export async function registerParticipant(userData) {
  return registerUser({ ...userData, role: 'participant' });
}

export async function createStaffUser(staffData) {
  return registerUser({ ...staffData, role: staffData.role || 'mentor' });
}

export async function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return { user };
    }
  } catch (e) {}

  // Default to participant if empty
  const defaultUser = INITIAL_DEMO_USERS['demo.participant@hackhub.ai'];
  localStorage.setItem('user', JSON.stringify(defaultUser));
  return { user: defaultUser };
}

export async function checkInUser() {
  const userStr = localStorage.getItem('user');
  let user = userStr ? JSON.parse(userStr) : INITIAL_DEMO_USERS['demo.participant@hackhub.ai'];

  const currentStreak = (user.profile?.check_in_streak || 0) + 1;
  const currentCount = (user.profile?.check_in_count || 0) + 1;

  user.profile = {
    ...(user.profile || {}),
    check_in_streak: currentStreak,
    check_in_count: currentCount,
  };

  localStorage.setItem('user', JSON.stringify(user));
  const users = getStorageUsers();
  users[user.email.toLowerCase()] = user;
  saveStorageUsers(users);

  return {
    already_checked_in: false,
    message: `Daily check-in successful! (+1 streak, total: ${currentCount})`,
    user,
  };
}

export async function updateProfile(updatedData) {
  const userStr = localStorage.getItem('user');
  let user = userStr ? JSON.parse(userStr) : INITIAL_DEMO_USERS['demo.participant@hackhub.ai'];

  if (updatedData.name) {
    user.name = updatedData.name;
  }

  const existingProfile = user.profile || {};
  const newProfile = {
    ...existingProfile,
    ...updatedData,
    avatar_url: updatedData.avatar_url || updatedData.avatar || existingProfile.avatar_url || '',
    skills: Array.isArray(updatedData.skills) ? JSON.stringify(updatedData.skills) : (updatedData.skills || existingProfile.skills || '[]'),
    interests: Array.isArray(updatedData.interests) ? JSON.stringify(updatedData.interests) : (updatedData.interests || existingProfile.interests || '[]'),
    techStack: Array.isArray(updatedData.techStack) ? JSON.stringify(updatedData.techStack) : (updatedData.techStack || existingProfile.techStack || '[]'),
  };

  user.profile = newProfile;
  localStorage.setItem('user', JSON.stringify(user));

  const users = getStorageUsers();
  users[user.email.toLowerCase()] = user;
  saveStorageUsers(users);

  return {
    message: 'Profile updated successfully',
    user,
    profile: newProfile,
  };
}
