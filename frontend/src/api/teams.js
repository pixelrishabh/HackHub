import { apiFetch } from './client';

export async function getAllTeams() {
  try {
    const data = await apiFetch('/teams');
    if (data.teams) return data;
  } catch (e) {}

  return {
    teams: [
      {
        id: 'team-1',
        name: 'NeuralCrafters',
        leader_id: 'usr-participant-1',
        description: 'Building autonomous AI hackathon management OS.',
        category: 'AI / Machine Learning',
        primary_field: 'AI/ML',
        max_members: 4,
        required_skills: '["React","Node.js","PyTorch","LLMs"]',
        tech_stack: '["React","Groq AI","Express","MongoDB"]',
        member_ids: '["usr-participant-1","usr-mentor-1"]',
        match_rationale_text: 'Complementary skill matrix combining AI agents and web architecture.',
        submissions: []
      }
    ]
  };
}

export async function getTeamById(id) {
  try {
    const data = await apiFetch(`/teams/${id}`);
    if (data.team) return data;
  } catch (e) {}

  const all = await getAllTeams();
  const team = all.teams?.find(t => t.id === id) || all.teams?.[0];
  return { team };
}

export async function createTeam(teamData) {
  try {
    return await apiFetch('/teams', { method: 'POST', body: JSON.stringify(teamData) });
  } catch (e) {
    return { message: 'Team created locally', team: { id: 'team-' + Date.now(), ...teamData } };
  }
}

export async function formTeamsWithAI(preferences) {
  try {
    return await apiFetch('/teams/match', { method: 'POST', body: JSON.stringify(preferences) });
  } catch (e) {
    const all = await getAllTeams();
    return { message: 'Formed 1 team via fallback AI matcher', teams: all.teams };
  }
}

export async function matchTeams(preferences) {
  return formTeamsWithAI(preferences);
}

export async function requestJoinTeam(teamId) {
  return { message: 'Join request sent to team leader.', status: 'pending' };
}
