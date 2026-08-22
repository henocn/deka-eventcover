const translationCache = new Map();

const SIMPLE_TRANSLATIONS = [
  [/^Jour(?:nee)?\s+(\d+)$/i, 'Day $1'],
  [/^Session\s+(\d+)$/i, 'Session $1'],
  [/^Partie\s+(\d+)$/i, 'Part $1'],
  [/^Phase\s+(\d+)$/i, 'Phase $1'],
];

// Applique les traductions locales pour les libelles courts frequents.
function translateWithSimpleRules(text) {
  for (const [pattern, replacement] of SIMPLE_TRANSLATIONS) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }

  return null;
}

// Decode les entites HTML parfois renvoyees par MyMemory.
function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// Detecte une traduction API corrompue ou peu fiable.
function isBrokenTranslation(source, translated) {
  if (!translated) return true;
  if (/MYMEMORY WARNING/i.test(translated)) return true;
  if (/&#(?:\d+|x[0-9a-f]+);/i.test(translated)) return true;
  if (/[\u25A1\uFFFD□]/.test(translated)) return true;
  if (/^[A-Z0-9\s\-–—.,!?'"():&]+$/i.test(source) && !/[àâäéèêëïîôùûüçœæ]/i.test(source)) {
    return false;
  }
  if (translated.length < Math.max(2, Math.floor(source.length * 0.35))) return true;

  return false;
}

// Nettoie et valide le texte renvoye par l'API de traduction.
function normalizeTranslatedText(source, translated) {
  const cleaned = decodeHtmlEntities(String(translated || '').trim())
    .replace(/\s+MYMEMORY WARNING[\s\S]*$/i, '')
    .trim();

  if (!cleaned || isBrokenTranslation(source, cleaned)) {
    return source;
  }

  return cleaned;
}

// Traduit un texte francais vers l'anglais via regles locales puis MyMemory.
export async function translateFrToEn(text) {
  const source = String(text || '').trim();
  if (!source) return source;

  const simpleTranslation = translateWithSimpleRules(source);
  if (simpleTranslation) {
    translationCache.set(source, simpleTranslation);
    return simpleTranslation;
  }

  if (translationCache.has(source)) {
    const cached = translationCache.get(source);
    if (!isBrokenTranslation(source, cached)) {
      return cached;
    }
    translationCache.delete(source);
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=fr|en`,
    );
    const payload = await response.json();
    const translated = normalizeTranslatedText(
      source,
      payload?.responseData?.translatedText || source,
    );
    translationCache.set(source, translated);
    return translated;
  } catch {
    return source;
  }
}

const API_ERROR_MAP = {
  'Badge non reconnu': 'apiErrors.badgeNotRecognized',
  'Invalid access code': 'apiErrors.invalidAccessCode',
  'Access code required': 'apiErrors.accessCodeRequired',
  'Photo requise.': 'apiErrors.photoRequired',
  'Event not found': 'apiErrors.eventNotFound',
  'Album not found': 'apiErrors.albumNotFound',
  'Media not found': 'apiErrors.mediaNotFound',
  'Trop de requetes. Reessayez dans une minute.': 'apiErrors.tooManyRequests',
  'Trop de recherches faciales. Reessayez dans une minute.': 'apiErrors.tooManyFaceSearches',
  'Trop de telechargements. Reessayez dans une minute.': 'apiErrors.tooManyDownloads',
  'Certaines informations sont invalides.': 'apiErrors.invalidInformation',
  'Aucun visage detecte sur la photo.': 'apiErrors.noFaceDetected',
  'Le service IA facial a mis trop de temps a repondre.': 'apiErrors.faceServiceTimeout',
  'Une erreur est survenue': 'apiErrors.genericError',
  'Resource not found': 'apiErrors.resourceNotFound',
  'Badge not found': 'apiErrors.badgeNotFound',
};

// Retourne la traduction i18n d'un message API connu, sinon le message original.
export function translateApiError(message, t) {
  if (!message) return '';
  const key = API_ERROR_MAP[message];
  if (key) return t(key);

  if (message.startsWith('Plusieurs visages detectes')) {
    const count = message.match(/\((\d+)\)/)?.[1];
    return t('apiErrors.multipleFaces', { count: count || '?' });
  }

  if (message.startsWith('Service IA facial indisponible')) {
    return t('apiErrors.faceServiceUnavailable');
  }

  return message;
}
