import { apiFetch } from './client';

export async function getSponsorProjects() {
  return apiFetch('/sponsor/projects', {
    method: 'GET',
  });
}

export async function getSponsorTalent() {
  return apiFetch('/sponsor/talent', {
    method: 'GET',
  });
}

export async function toggleSponsorBookmark(target_type, target_id, notes = '') {
  return apiFetch('/sponsor/bookmark', {
    method: 'POST',
    body: JSON.stringify({ target_type, target_id, notes }),
  });
}

export async function getSponsorBookmarks() {
  return apiFetch('/sponsor/bookmarks', {
    method: 'GET',
  });
}
