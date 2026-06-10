const authService = require('../services/authService');

async function login(req, res) {
  const payload = req.validated.body;
  const result = await authService.login(payload);
  res.json({ data: result });
}

async function getProfile(req, res) {
  res.json({ data: authService.serializeUser(req.user) });
}

async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user, req.validated.body);
  res.json({ data: user });
}

module.exports = {
  getProfile,
  login,
  updateProfile,
};
