const path = require('path');
const mediaService = require('../services/mediaService');

async function sendMediaFile(req, res) {
  const result = await mediaService.getMediaFileResponse(
    req.validated.params.mediaId,
    req.validated.query.accessCode,
    req,
    'view'
  );

  res.type(result.media.mimeType);
  res.sendFile(result.absolutePath);
}

async function downloadMediaFile(req, res) {
  const result = await mediaService.getMediaFileResponse(
    req.validated.params.mediaId,
    req.validated.query.accessCode,
    req,
    'download'
  );

  res.download(result.absolutePath, path.basename(result.media.originalName));
}

module.exports = {
  sendMediaFile,
  downloadMediaFile,
};
