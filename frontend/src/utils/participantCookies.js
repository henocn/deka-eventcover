const COOKIE_TTL_SECONDS = 60 * 60 * 48;

function cookiePath(eventSlug) {
  return eventSlug ? `/events/${eventSlug}` : '/';
}

function cookieName(prefix, eventSlug, accessRole = '') {
  return [
    'deka',
    prefix,
    encodeURIComponent(eventSlug || 'event'),
    encodeURIComponent(accessRole || 'classic'),
  ].join('.');
}

function setCookie(name, value, eventSlug) {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${COOKIE_TTL_SECONDS}`,
    `Path=${cookiePath(eventSlug)}`,
    'SameSite=Lax',
  ].join('; ');
}

function getCookie(name) {
  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=') || '';
}

function deleteCookie(name, eventSlug) {
  document.cookie = `${name}=; Max-Age=0; Path=${cookiePath(eventSlug)}; SameSite=Lax`;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 8192;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeEmbedding(embedding) {
  const bytes = new Uint8Array(embedding.length * 2);
  const view = new DataView(bytes.buffer);

  embedding.forEach((value, index) => {
    const clamped = Math.max(-1, Math.min(1, Number(value) || 0));
    view.setInt16(index * 2, Math.round(clamped * 32767), true);
  });

  return bytesToBase64(bytes);
}

function decodeEmbedding(value) {
  if (!value) return null;

  try {
    const bytes = base64ToBytes(value);
    if (bytes.length !== 1024) return null;

    const view = new DataView(bytes.buffer);
    return Array.from({ length: 512 }, (_, index) => (
      Number((view.getInt16(index * 2, true) / 32767).toFixed(8))
    ));
  } catch {
    return null;
  }
}

function saveAccessCodeCookie(eventSlug, accessCode) {
  if (!eventSlug || !accessCode) return;
  setCookie(cookieName('access', eventSlug), accessCode, eventSlug);
}

function getAccessCodeCookie(eventSlug) {
  if (!eventSlug) return '';
  return decodeURIComponent(getCookie(cookieName('access', eventSlug)));
}

function saveMyPhotosEmbeddingCookie(eventSlug, accessRole, embedding) {
  if (!eventSlug || !Array.isArray(embedding) || embedding.length !== 512) return;
  setCookie(cookieName('face', eventSlug, accessRole), encodeEmbedding(embedding), eventSlug);
}

function getMyPhotosEmbeddingCookie(eventSlug, accessRole) {
  if (!eventSlug) return null;
  return decodeEmbedding(getCookie(cookieName('face', eventSlug, accessRole)));
}

function clearMyPhotosEmbeddingCookie(eventSlug, accessRole) {
  deleteCookie(cookieName('face', eventSlug, accessRole), eventSlug);
}

export {
  clearMyPhotosEmbeddingCookie,
  getAccessCodeCookie,
  getMyPhotosEmbeddingCookie,
  saveAccessCodeCookie,
  saveMyPhotosEmbeddingCookie,
};
