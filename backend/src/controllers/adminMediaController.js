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

module.exports = {
  uploadAlbumMedia,
};
