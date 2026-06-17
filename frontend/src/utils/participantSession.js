const ACCESS_TTL_MS = 24 * 60 * 60 * 1000;

function accessKey(eventSlug) {
  return `deka.access.${eventSlug || 'event'}`;
}

function saveAccessCodeSession(eventSlug, accessCode) {
  if (!eventSlug || !accessCode) return;

  window.sessionStorage.setItem(accessKey(eventSlug), JSON.stringify({
    accessCode,
    expiresAt: Date.now() + ACCESS_TTL_MS,
  }));
}

function getAccessCodeSession(eventSlug) {
  if (!eventSlug) return '';

  try {
    const payload = JSON.parse(window.sessionStorage.getItem(accessKey(eventSlug)) || '{}');
    if (!payload.accessCode || !payload.expiresAt || Date.now() > payload.expiresAt) {
      window.sessionStorage.removeItem(accessKey(eventSlug));
      return '';
    }

    return payload.accessCode;
  } catch {
    window.sessionStorage.removeItem(accessKey(eventSlug));
    return '';
  }
}

export {
  getAccessCodeSession,
  saveAccessCodeSession,
};
