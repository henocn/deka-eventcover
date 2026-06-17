const mediaService = require('../services/mediaService');

async function uploadAlbumMedia(req, res) {
  const result = await mediaService.uploadAlbumMedia(
    req.validated.params.albumId,
    req.files,
    req.user
  );

  const io = req.app.get('io');

  if (io) {
    io.to(`event:${result.event.slug}`).emit('media:created', {
      eventId: result.event.id,
      albumId: result.album.id,
      media: result.media,
    });
  }

  res.status(201).json({ data: result.media });
}

async function sendAdminMediaFile(req, res) {
  const result = await mediaService.getAdminMediaFileResponse(req.validated.params.mediaId);

  res.type(result.media.mimeType);
  res.sendFile(result.absolutePath);
}

async function deleteAdminMedia(req, res) {
  const result = await mediaService.deleteAdminMedia(req.validated.params.mediaId);
  const io = req.app.get('io');

  if (io) {
    io.to(`event:${result.event.slug}`).emit('media:deleted', {
      eventId: result.event.id,
      albumId: result.album.id,
      mediaId: result.mediaId,
    });
  }

  res.json({ data: { id: result.mediaId } });
}

module.exports = {
  deleteAdminMedia,
  uploadAlbumMedia,
  sendAdminMediaFile,
};
