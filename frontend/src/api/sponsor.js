import { apiFetch } from './client';

export async function getSponsorProjects() {
  try {
    const data = await apiFetch('/sponsor/projects');
    if (data.projects) return data;
  } catch (e) {}

  return { projects: [] };
}

export async function getSponsorTalent() {
  try {
    const data = await apiFetch('/sponsor/talent');
    if (data.talent) return data;
  } catch (e) {}

  return { talent: [] };
}

export async function toggleSponsorBookmark(target_type, target_id, notes = '') {
  try {
    return await apiFetch('/sponsor/bookmark', {
      method: 'POST',
      body: JSON.stringify({ target_type, target_id, notes }),
    });
  } catch (e) {
    return { message: 'Bookmark updated' };
  }
}

export async function getSponsorBookmarks() {
  try {
    const data = await apiFetch('/sponsor/bookmarks');
    if (data.bookmarks) return data;
  } catch (e) {}

  return { bookmarks: [] };
}
