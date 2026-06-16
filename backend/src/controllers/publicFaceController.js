const faceService = require('../services/faceService');
const httpError = require('../utils/httpError');

async function findMyPhotos(req, res) {
  if (!req.file) {
    throw httpError(400, 'Photo requise.');
  }

  const { slug } = req.validated.params;
  const { accessCode, role } = req.validated.query;
  const matches = await faceService.searchMyPhotos(slug, accessCode, role, req.file.buffer);

  res.json({
    data: {
      matches,
    },
  });
}

module.exports = {
  findMyPhotos,
};
