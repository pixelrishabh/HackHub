import { apiFetch } from './client';

export async function loginUser(credentials) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerParticipant(data) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createStaffUser(data) {
  return apiFetch('/auth/create-staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser() {
  return apiFetch('/auth/me', {
    method: 'GET',
  });
}

export async function checkInUser() {
  return apiFetch('/auth/check-in', {
    method: 'POST',
  });
}

export async function updateProfile(data) {
  return apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
