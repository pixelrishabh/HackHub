import { apiFetch } from './client';

export async function checkInTeam(teamId) {
  return apiFetch(`/teams/${teamId}/check-in`, {
    method: 'POST',
  });
}

export async function getTeamEngagement(teamId) {
  return apiFetch(`/teams/${teamId}/engagement`, {
    method: 'GET',
  });
}

export async function getEngagementDashboard() {
  return apiFetch('/engagement/dashboard', {
    method: 'GET',
  });
}
