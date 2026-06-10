const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const httpError = require('../utils/httpError');

async function requireAdmin(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      throw httpError(401, 'Authentication required');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(payload.sub);

    if (!user || !user.isActive) {
      throw httpError(401, 'Invalid user');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error.status ? error : httpError(401, 'Invalid token'));
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return next(httpError(403, 'Acces reserve aux super administrateurs.'));
  }

  return next();
}

module.exports = {
  requireAdmin,
  requireSuperAdmin,
};
