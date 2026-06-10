const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const httpError = require('../utils/httpError');
const bcrypt = require('bcryptjs');

function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user || !user.isActive) {
    throw httpError(401, 'Invalid credentials');
  }

  const passwordIsValid = await user.verifyPassword(password);

  if (!passwordIsValid) {
    throw httpError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: '12h' }
  );

  return {
    token,
    user: serializeUser(user),
  };
}

async function updateProfile(user, payload) {
  const updates = {};

  if (payload.fullName) {
    updates.fullName = payload.fullName;
  }

  if (payload.currentPassword || payload.newPassword) {
    if (!payload.currentPassword || !payload.newPassword) {
      throw httpError(400, 'Mot de passe actuel et nouveau mot de passe requis.');
    }

    const passwordIsValid = await user.verifyPassword(payload.currentPassword);

    if (!passwordIsValid) {
      throw httpError(400, 'Mot de passe actuel incorrect.');
    }

    updates.passwordHash = await bcrypt.hash(payload.newPassword, 12);
  }

  await user.update(updates);
  return serializeUser(user);
}

module.exports = {
  login,
  serializeUser,
  updateProfile,
};
