const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const httpError = require('../utils/httpError');

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
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  login,
};
