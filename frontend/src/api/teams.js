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
