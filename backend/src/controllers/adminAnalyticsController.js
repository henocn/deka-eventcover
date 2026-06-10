const analyticsService = require('../services/analyticsService');

async function getAnalytics(req, res) {
  const eventId = req.validated.query.eventId || null;
  const analytics = await analyticsService.getAnalytics({ eventId });

  res.json({ data: analytics });
}

module.exports = {
  getAnalytics,
};
