// Standalone Client-Side Teams Provider backed by localStorage

const INITIAL_TEAMS = [
  {
    id: 'team-1',
    name: 'NeuralCrafters',
    leader_id: 'usr-participant-1',
    description: 'Building autonomous AI hackathon management OS.',
    logo_url: '',
    category: 'AI / Machine Learning',
    primary_field: 'AI/ML',
    max_members: 4,
    required_skills: '["React","Node.js","PyTorch","LLMs"]',
    tech_stack: '["React","Groq AI","Vite","TailwindCSS"]',
    member_ids: '["usr-participant-1","usr-mentor-1"]',
    match_rationale_text: 'Complementary skill matrix combining Alex (AI Agents), Priya (UI/UX), and Liam (Backend).',
    createdAt: new Date().toISOString(),
    submissions: [
      {
        id: 'sub-1',
        team_id: 'team-1',
        repo_link: 'https://github.com/neuralcrafters/hackops-agent',
        description: 'Autonomous AI hackathon management OS with real-time scoring & RAG mentor.',
        demo_video_link: 'https://youtube.com/watch?v=demo',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'team-2',
    name: 'DataPulse AI',
    leader_id: 'usr-judge-1',
    description: 'Real-time telemetry and similarity scoring for hackathons.',
    logo_url: '',
    category: 'Data & Analytics',
    primary_field: 'Data & Analytics',
    max_members: 4,
    required_skills: '["Python","FastAPI","PostgreSQL","D3.js"]',
    tech_stack: '["Python","FastAPI","React"]',
    member_ids: '["usr-judge-1"]',
    match_rationale_text: 'High-speed data streaming and analytical dashboard architecture.',
    createdAt: new Date().toISOString(),
    submissions: []
  }
];

function getStorageTeams() {
  try {
    const raw = localStorage.getItem('hackhub_teams');
    if (!raw) {
      localStorage.setItem('hackhub_teams', JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_TEAMS;
  }
}

function saveStorageTeams(teams) {
  try {
    localStorage.setItem('hackhub_teams', JSON.stringify(teams));
  } catch (e) {}
}

export async function getAllTeams() {
  const teams = getStorageTeams();
  return { teams };
}

export async function getTeamById(id) {
  const teams = getStorageTeams();
  const team = teams.find(t => t.id === id);
  if (!team) {
    throw new Error(`Team with ID '${id}' not found.`);
  }
  return { team };
}

export async function createTeam(teamData) {
  const teams = getStorageTeams();
  const newTeam = {
    id: 'team-' + Date.now(),
    name: teamData.name || 'New AI Team',
    leader_id: 'usr-participant-1',
    description: teamData.description || '',
    logo_url: teamData.logo_url || '',
    category: teamData.category || 'AI / Machine Learning',
    primary_field: teamData.primary_field || 'AI/ML',
    max_members: teamData.max_members || 4,
    required_skills: JSON.stringify(teamData.required_skills || ['React', 'AI']),
    tech_stack: JSON.stringify(teamData.tech_stack || ['React', 'Node.js']),
    member_ids: JSON.stringify(['usr-participant-1']),
    match_rationale_text: 'Newly formed hackathon team.',
    createdAt: new Date().toISOString(),
    submissions: [],
  };

  teams.push(newTeam);
  saveStorageTeams(teams);

  return {
    message: 'Team created successfully',
    team: newTeam,
  };
}

export async function updateTeam(id, updateData) {
  const teams = getStorageTeams();
  const idx = teams.findIndex(t => t.id === id);
  if (idx === -1) {
    throw new Error(`Team with ID '${id}' not found.`);
  }

  teams[idx] = {
    ...teams[idx],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  saveStorageTeams(teams);

  return {
    message: 'Team updated successfully',
    team: teams[idx],
  };
}

export async function formTeamsWithAI(preferences) {
  const teams = getStorageTeams();
  return {
    message: 'Successfully formed 1 balanced team(s) using AI.',
    teams,
  };
}

export async function requestJoinTeam(teamId) {
  return {
    message: 'Join request sent successfully to team leader.',
    status: 'pending',
  };
}
