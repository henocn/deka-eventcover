const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Une erreur est survenue');
    error.status = response.status;
    error.requiresAccessCode = Boolean(payload.requiresAccessCode);
    error.invalidBadge = Boolean(payload.invalidBadge);
    throw error;
  }

  return payload.data;
}

function withAccess(path, accessCode, role) {
  const url = new URL(`${API_URL}${path}`);

  if (accessCode) {
    url.searchParams.set('accessCode', accessCode);
  }

  if (role) {
    url.searchParams.set('role', role);
  }

  return url.toString();
}

export async function fetchPublicEvent(slug, accessCode, role) {
  const response = await fetch(withAccess(`/api/public/events/${slug}`, accessCode, role));
  return parseResponse(response);
}

export async function fetchPublicAlbum(eventSlug, albumSlug, accessCode, role) {
  const response = await fetch(
    withAccess(`/api/public/events/${eventSlug}/albums/${albumSlug}`, accessCode, role),
  );
  return parseResponse(response);
}

export async function validateEventAccess(slug, accessCode) {
  const response = await fetch(`${API_URL}/api/public/events/${slug}/access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessCode }),
  });

  return parseResponse(response);
}

export function getMediaUrl(media, accessCode, role, mode = 'file') {
  if (!media?.id) {
    return '';
  }

  return withAccess(`/api/public/media/${media.id}/${mode}`, accessCode, role);
}

export { API_URL };
