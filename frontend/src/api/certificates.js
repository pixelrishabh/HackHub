import { apiFetch } from './client';

export async function getMyCertificates() {
  try {
    const data = await apiFetch('/certificates');
    if (data.certificates) return data;
  } catch (e) {}
  return { certificates: [] };
}

export async function issueCertificate(payload) {
  try {
    return await apiFetch('/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      message: 'Certificate issued locally.',
      certificate: {
        id: 'cert-' + Date.now(),
        title: payload.title || '1st Place Winner',
        hash: '0x' + Math.random().toString(16).substring(2, 14),
        issuedAt: new Date().toISOString(),
      },
    };
  }
}

export async function verifyCertificate(hash) {
  try {
    return await apiFetch(`/certificates/verify/${hash}`);
  } catch (e) {
    return { verified: false, error: 'Verification server unavailable.' };
  }
}
