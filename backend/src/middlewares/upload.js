const multer = require('multer');
const env = require('../config/env');
const httpError = require('../utils/httpError');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function isAllowedMimeType(mimeType) {
  return allowedMimeTypes.has(mimeType);
}

function getMediaType(mimeType) {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  return 'document';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
    files: 50,
  },
  fileFilter(req, file, callback) {
    if (!isAllowedMimeType(file.mimetype)) {
      return callback(httpError(400, `Unsupported file type: ${file.mimetype}`));
    }

    return callback(null, true);
  },
});

module.exports = {
  upload,
  isAllowedMimeType,
  getMediaType,
};
