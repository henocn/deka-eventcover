const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
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

function persistUser(user) {
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
    response = await fetch(new URL(path, API_URL), {
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

async function fetchProfile() {
  return apiRequest('/api/admin/profile');
}

async function updateProfile(payload) {
  const user = await apiRequest('/api/admin/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  persistUser(user);
  return user;
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

async function createAlbum(eventId, payload) {
  return apiRequest(`/api/admin/events/${eventId}/albums`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function fetchAlbum(albumId) {
  return apiRequest(`/api/admin/albums/${albumId}`);
}

async function updateAlbum(albumId, payload) {
  return apiRequest(`/api/admin/albums/${albumId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function uploadAlbumMedia(albumId, files) {
  const formData = new FormData();
  [...files].forEach((file) => formData.append('files', file));

  return apiRequest(`/api/admin/albums/${albumId}/media`, {
    method: 'POST',
    body: formData,
  });
}

async function deleteAlbum(albumId) {
  return apiRequest(`/api/admin/albums/${albumId}`, {
    method: 'DELETE',
  });
}

async function deleteEvent(eventId) {
  return apiRequest(`/api/admin/events/${eventId}`, {
    method: 'DELETE',
  });
}

async function fetchStats(eventId) {
  return apiRequest(`/api/admin/events/${eventId}/stats`);
}

async function fetchAnalytics(eventId) {
  const query = eventId ? `?${new URLSearchParams({ eventId })}` : '';
  return apiRequest(`/api/admin/analytics${query}`);
}

async function fetchAccessRoles(eventId) {
  return apiRequest(`/api/admin/events/${eventId}/access-roles`);
}

async function createAccessRole(eventId, payload) {
  return apiRequest(`/api/admin/events/${eventId}/access-roles`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function deleteAccessRole(roleId) {
  return apiRequest(`/api/admin/access-roles/${roleId}`, {
    method: 'DELETE',
  });
}

async function fetchAccessRoleQrCode(eventId, roleId) {
  return apiRequest(`/api/admin/events/${eventId}/access-roles/${roleId}/qrcode`);
}

export {
  API_URL,
  clearSession,
  createAccessRole,
  createAlbum,
  createEvent,
  deleteAccessRole,
  deleteAlbum,
  deleteEvent,
  fetchAccessRoleQrCode,
  fetchAccessRoles,
  fetchAnalytics,
  fetchAlbum,
  fetchEvents,
  fetchProfile,
  fetchStats,
  getStoredUser,
  getToken,
  login,
  updateAlbum,
  updateEvent,
  updateProfile,
  uploadAlbumMedia,
};
