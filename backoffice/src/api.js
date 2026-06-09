const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'deka.backoffice.token';
const USER_KEY = 'deka.backoffice.user';

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = Array.isArray(payload.errors)
      ? payload.errors.map((error) => error.message || error).filter(Boolean)
      : [];
    const message = [payload.message || 'Une erreur est survenue', ...details].join('\n');
    const error = new Error(message);
    error.status = response.status;
    error.details = details;
    throw error;
  }

  return payload.data;
}

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  const rawUser = window.localStorage.getItem(USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
}

function persistSession(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("API indisponible. Verifiez que le backend est lance.");
  }

  return parseResponse(response);
}

async function login(email, password) {
  const data = await apiRequest('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  persistSession(data.token, data.user);
  return data;
}

async function fetchEvents() {
  return apiRequest('/api/admin/events');
}

async function createEvent(payload) {
  return apiRequest('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateEvent(eventId, payload) {
  return apiRequest(`/api/admin/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function deleteEvent(eventId) {
  return apiRequest(`/api/admin/events/${eventId}`, {
    method: 'DELETE',
  });
}

async function fetchQrCode(eventId) {
  return apiRequest(`/api/admin/events/${eventId}/qrcode`);
}

async function fetchStats(eventId) {
  return apiRequest(`/api/admin/events/${eventId}/stats`);
}

export {
  API_URL,
  clearSession,
  createEvent,
  deleteEvent,
  fetchEvents,
  fetchQrCode,
  fetchStats,
  getStoredUser,
  getToken,
  login,
  updateEvent,
};
