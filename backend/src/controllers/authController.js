const authService = require('../services/authService');

async function login(req, res) {
  const payload = req.validated.body;
  const result = await authService.login(payload);
  res.json({ data: result });
}

module.exports = {
  login,
};
