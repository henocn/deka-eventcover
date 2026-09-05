const analyticsService = require('../services/analyticsService');

async function getAnalytics(req, res) {
  const eventId = req.validated.query.eventId || null;
  const period = req.validated.query.period || 'month';
  const analytics = await analyticsService.getAnalytics({ eventId, period });

  res.json({ data: analytics });
}

module.exports = {
  getAnalytics,
};
