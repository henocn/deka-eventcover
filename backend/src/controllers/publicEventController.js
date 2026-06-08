const eventService = require('../services/eventService');

async function getEvent(req, res) {
  const { slug } = req.validated.params;
  const { accessCode } = req.validated.query;
  const event = await eventService.getPublicEvent(slug, accessCode);

  res.json({ data: event });
}

async function validateAccess(req, res) {
  const { slug } = req.validated.params;
  const { accessCode } = req.validated.body;
  const result = await eventService.validateEventAccess(slug, accessCode);

  res.json({ data: result });
}

async function getAlbum(req, res) {
  const { slug, albumSlug } = req.validated.params;
  const { accessCode } = req.validated.query;
  const result = await eventService.getPublicAlbum(slug, albumSlug, accessCode);

  res.json({ data: result });
}

module.exports = {
  getEvent,
  validateAccess,
  getAlbum,
};
