import { apiFetch } from './client';

export async function sendMentorMessage({ team_id, message, mode = 'developer', repo_link, file_attachments = [] }) {
  return apiFetch('/mentor/chat', {
    method: 'POST',
    body: JSON.stringify({ team_id, message, mode, repo_link, file_attachments }),
  });
}

export async function getChatHistory(teamId) {
  return apiFetch(`/mentor/history/${teamId}`, {
    method: 'GET',
  });
}

export async function getProjectReview({ team_id, repo_link }) {
  return apiFetch('/mentor/review', {
    method: 'POST',
    body: JSON.stringify({ team_id, repo_link }),
  });
}

export async function uploadMentorFile({ fileName, fileType, fileSize, textContent }) {
  return apiFetch('/mentor/upload', {
    method: 'POST',
    body: JSON.stringify({ fileName, fileType, fileSize, textContent }),
  });
}
