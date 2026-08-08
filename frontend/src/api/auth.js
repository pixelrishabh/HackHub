import { apiFetch } from './client';

export async function loginUser(emailInput, passwordInput) {
  let email = emailInput;
  let password = passwordInput;

  if (typeof emailInput === 'object' && emailInput !== null) {
    email = emailInput.email;
    password = emailInput.password;
  }

  // Clear any stale session first
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: String(email || '').trim().toLowerCase(), password }),
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export async function registerUser(userData) {
  // Clear any stale session first
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (data.token) localStorage.setItem('token', data.token);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function createStaffUser(staffData) {
  return apiFetch('/auth/create-staff', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
}

export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('user');
    return { user: null };
  }

  try {
    const data = await apiFetch('/auth/me');
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
  } catch (e) {
    console.warn('[Auth] getCurrentUser session fetch failed:', e.message);
    const isExplicitAuthError = e.message && (
      e.message.toLowerCase().includes('expired') ||
      e.message.toLowerCase().includes('invalid') ||
      e.message.toLowerCase().includes('authentication required') ||
      e.message.toLowerCase().includes('401')
    );

    if (isExplicitAuthError) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { user: null };
    }
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return { user: JSON.parse(userStr) };
    } catch (e) {}
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { user: null };
}

export async function checkInUser() {
  const data = await apiFetch('/profile/activity', {
    method: 'POST',
    body: JSON.stringify({ event_type: 'check_in' }),
  });

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const currentStreak = (user.profile?.check_in_streak || 0) + 1;
      const currentCount = (user.profile?.check_in_count || 0) + 1;
      user.profile = { ...(user.profile || {}), check_in_streak: currentStreak, check_in_count: currentCount };
      localStorage.setItem('user', JSON.stringify(user));
      return { already_checked_in: false, message: `Daily check-in successful! (+1 streak, total: ${currentCount})`, user };
    } catch (e) {}
  }
  return data;
}

export async function updateProfile(updatedData) {
  const data = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}
