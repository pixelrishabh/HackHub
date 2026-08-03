import { apiFetch } from './client';

export async function getHackathons(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.track && params.track !== 'All') query.append('track', params.track);
  if (params.search) query.append('search', params.search);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch(`/hackathons${queryString}`);
}

export async function getHackathonById(id) {
  return apiFetch(`/hackathons/${id}`);
}

export async function registerUserForHackathon(id) {
  return apiFetch(`/hackathons/${id}/register`, {
    method: 'POST',
  });
}

export async function createHackathon(data) {
  return apiFetch('/hackathons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
