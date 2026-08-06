// Production API Fetch Adapter connecting Frontend to Backend API (Render / Local)

let rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}
const BASE_URL = rawBaseUrl;

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.message || `API error: ${res.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Fetch Error] ${options.method || 'GET'} ${cleanEndpoint}:`, error.message);
    throw error;
  }
}
