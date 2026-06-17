const faceService = require('../services/faceService');
const httpError = require('../utils/httpError');

async function findMyPhotos(req, res) {
  if (!req.file) {
    throw httpError(400, 'Photo requise.');
  }

  const { slug } = req.validated.params;
  const { accessCode, role } = req.validated.query;
  const result = await faceService.searchMyPhotos(slug, accessCode, role, req.file.buffer);

  res.json({
    data: {
      matches: result.matches,
      diagnostics: result.diagnostics,
      embedding: result.embedding,
    },
  });
}

async function findMyPhotosByEmbedding(req, res) {
  const { slug } = req.validated.params;
  const { accessCode, role } = req.validated.query;
  const result = await faceService.searchMyPhotosWithEmbedding(
    slug,
    accessCode,
    role,
    req.validated.body.embedding,
  );

  res.json({
    data: {
      matches: result.matches,
      diagnostics: result.diagnostics,
    },
  });
}

module.exports = {
  findMyPhotos,
  findMyPhotosByEmbedding,
};
