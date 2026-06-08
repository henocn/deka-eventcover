const path = require('path');

function sanitizeBaseName(value) {
  return path
    .basename(value || 'file')
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function extensionFromMime(mimeType) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  };

  return extensions[mimeType] || '';
}

function extensionFromName(originalName, mimeType) {
  const ext = path.extname(originalName || '').toLowerCase();
  return ext || extensionFromMime(mimeType);
}

module.exports = {
  sanitizeBaseName,
  extensionFromMime,
  extensionFromName,
};
