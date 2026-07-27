import { apiFetch } from './client';

export async function matchTeams(participants = []) {
  return apiFetch('/teams/match', {
    method: 'POST',
    body: JSON.stringify({ participants }),
  });
}

export async function getAllTeams() {
  return apiFetch('/teams', {
    method: 'GET',
  });
}

export async function getTeamById(id) {
  return apiFetch(`/teams/${id}`, {
    method: 'GET',
  });
}

// NEW TEAM MANAGEMENT API FUNCTIONS

export async function createTeam(teamData) {
  return apiFetch('/teams/create', {
    method: 'POST',
    body: JSON.stringify(teamData),
  });
}

export async function browseTeams(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiFetch(`/teams/browse${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}

export async function createJoinRequest(teamId) {
  return apiFetch(`/teams/${teamId}/join-request`, {
    method: 'POST',
  });
}

export async function cancelJoinRequest(teamId) {
  return apiFetch(`/teams/${teamId}/join-request`, {
    method: 'DELETE',
  });
}

export async function acceptJoinRequest(teamId, requestId) {
  return apiFetch(`/teams/${teamId}/join-request/${requestId}/accept`, {
    method: 'POST',
  });
}

export async function rejectJoinRequest(teamId, requestId) {
  return apiFetch(`/teams/${teamId}/join-request/${requestId}/reject`, {
    method: 'POST',
  });
}

export async function leaveTeam(teamId) {
  return apiFetch(`/teams/${teamId}/leave`, {
    method: 'POST',
  });
}

export async function getTeamRequests(teamId) {
  return apiFetch(`/teams/${teamId}/requests`, {
    method: 'GET',
  });
}

export async function getTeamCompatibility(teamId) {
  return apiFetch(`/teams/${teamId}/compatibility`, {
    method: 'GET',
  });
}

export async function getTeamDashboardDetailed(teamId) {
  return apiFetch(`/teams/${teamId}/dashboard`, {
    method: 'GET',
  });
}
