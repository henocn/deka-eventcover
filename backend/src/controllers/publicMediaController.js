const path = require('path');
const mediaService = require('../services/mediaService');

async function sendMediaFile(req, res) {
  const result = await mediaService.getMediaFileResponse(
    req.validated.params.mediaId,
    req.validated.query.accessCode,
    req.validated.query.role,
    req,
    'view'
  );

  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.type(result.media.mimeType);
  res.sendFile(result.absolutePath);
}

async function sendMediaThumb(req, res) {
  const result = await mediaService.getMediaThumbResponse(
    req.validated.params.mediaId,
    req.validated.query.accessCode,
    req.validated.query.role,
  );

  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.type('image/webp');
  res.sendFile(result.absolutePath);
}

async function downloadMediaFile(req, res) {
  const result = await mediaService.getMediaFileResponse(
    req.validated.params.mediaId,
    req.validated.query.accessCode,
    req.validated.query.role,
    req,
    'download'
  );

  res.download(result.absolutePath, path.basename(result.media.originalName));
}

module.exports = {
  sendMediaFile,
  sendMediaThumb,
  downloadMediaFile,
};
