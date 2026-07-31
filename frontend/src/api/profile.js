import { apiFetch } from './client';

export async function getProfile(userId) {
  const endpoint = userId ? `/profile/${userId}` : '/profile/me';
  return apiFetch(endpoint);
}

export async function updateProfile(profileData) {
  return apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function getContributions(userId) {
  const query = userId ? `?userId=${userId}` : '';
  return apiFetch(`/profile/contributions${query}`);
}

export async function getStreak(userId) {
  const query = userId ? `?userId=${userId}` : '';
  return apiFetch(`/profile/streak${query}`);
}

export async function getActivity(userId, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  params.append('page', page);
  params.append('limit', limit);
  return apiFetch(`/profile/activity?${params.toString()}`);
}

export async function postActivity(activityData) {
  return apiFetch('/profile/activity', {
    method: 'POST',
    body: JSON.stringify(activityData),
  });
}
