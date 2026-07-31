import { apiFetch } from './client';

export async function getAnalyticsDashboard() {
  return apiFetch('/analytics/dashboard', {
    method: 'GET',
  });
}

export async function generateCertificates() {
  return apiFetch('/analytics/certificates/generate', {
    method: 'POST',
  });
}

export async function getUserCertificates(userId = '') {
  const endpoint = userId ? `/analytics/certificates/user/${userId}` : '/analytics/certificates/user';
  return apiFetch(endpoint, {
    method: 'GET',
  });
}

export async function verifyCertificate(hash) {
  return apiFetch(`/analytics/certificates/verify/${hash}`, {
    method: 'GET',
  });
}
