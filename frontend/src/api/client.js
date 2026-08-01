let BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${BASE_URL}${formattedEndpoint}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Port fallback for local dev (5001 <-> 5000)
    if (!err.status && url.includes('localhost:5001')) {
      const fallbackUrl = url.replace('localhost:5001', 'localhost:5000');
      try {
        const fallbackRes = await fetch(fallbackUrl, config);
        const fallbackData = await fallbackRes.json().catch(() => ({}));
        if (fallbackRes.ok) {
          BASE_URL = BASE_URL.replace('localhost:5001', 'localhost:5000');
          return fallbackData;
        }
      } catch (e) {}
    } else if (!err.status && url.includes('localhost:5000')) {
      const fallbackUrl = url.replace('localhost:5000', 'localhost:5001');
      try {
        const fallbackRes = await fetch(fallbackUrl, config);
        const fallbackData = await fallbackRes.json().catch(() => ({}));
        if (fallbackRes.ok) {
          BASE_URL = BASE_URL.replace('localhost:5000', 'localhost:5001');
          return fallbackData;
        }
      } catch (e) {}
    }

    if (!err.status) {
      console.error(`[API Network Error] ${options.method || 'GET'} ${url}:`, err);
    }
    throw err;
  }
}
