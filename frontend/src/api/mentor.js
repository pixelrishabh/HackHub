import { apiFetch } from './client';

export async function sendMentorMessage({ team_id, message, repo_link }) {
  return apiFetch('/mentor/chat', {
    method: 'POST',
    body: JSON.stringify({ team_id, message, repo_link }),
  });
}

export async function getChatHistory(teamId) {
  return apiFetch(`/mentor/history/${teamId}`, {
    method: 'GET',
  });
}
