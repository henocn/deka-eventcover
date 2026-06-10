import { demoEvent } from '../demoData';

function getInitialSlug() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const eventIndex = parts.indexOf('events');
  return eventIndex >= 0 ? parts[eventIndex + 1] || '' : '';
}

function getInitialRole() {
  return (new URLSearchParams(window.location.search).get('role') || '').toUpperCase();
}

function formatDate(value) {
  if (!value) return 'Date a confirmer';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function normalizeAlbums(albums) {
  return [...(albums || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function albumCover(album) {
  return album.coverUrl || album.coverMedia?.publicUrl || album.media?.find((item) => item.type === 'image')?.publicUrl;
}

function isDemoMedia(media) {
  return String(media?.id || '').startsWith('demo-');
}

function fallbackSlug() {
  return demoEvent.slug;
}

export {
  albumCover,
  fallbackSlug,
  formatDate,
  getInitialRole,
  getInitialSlug,
  isDemoMedia,
  normalizeAlbums,
};
