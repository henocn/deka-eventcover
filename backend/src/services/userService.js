const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const httpError = require('../utils/httpError');

function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function listUsers() {
  const users = await User.findAll({
    order: [
      ['role', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });

  return users.map(serializeUser);
}

async function ensureUniqueEmail(email, ignoreId) {
  const where = { email: email.toLowerCase() };

  if (ignoreId) {
    where.id = { [Op.ne]: ignoreId };
  }

  const existingUser = await User.findOne({ where });

  if (existingUser) {
    throw httpError(409, 'Un utilisateur existe deja avec cet email.');
  }
}

async function createUser(payload) {
  await ensureUniqueEmail(payload.email);

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    passwordHash: await bcrypt.hash(payload.password, 12),
    role: payload.role,
    isActive: payload.isActive ?? true,
  });

  return serializeUser(user);
}

async function getUser(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw httpError(404, 'Utilisateur introuvable.');
  }

  return user;
}

async function updateUser(userId, payload, currentUser) {
  const user = await getUser(userId);
  const updates = {};

  if (payload.email) {
    const email = payload.email.toLowerCase();
    await ensureUniqueEmail(email, user.id);
    updates.email = email;
  }

  if (payload.fullName !== undefined) updates.fullName = payload.fullName;
  if (payload.role !== undefined) updates.role = payload.role;
  if (payload.isActive !== undefined) updates.isActive = payload.isActive;
  if (payload.password) updates.passwordHash = await bcrypt.hash(payload.password, 12);

  if (currentUser?.id === user.id && updates.isActive === false) {
    throw httpError(400, 'Vous ne pouvez pas desactiver votre propre compte.');
  }

  if (currentUser?.id === user.id && updates.role && updates.role !== 'super_admin') {
    throw httpError(400, 'Vous ne pouvez pas retirer votre propre role super admin.');
  }

  await user.update(updates);
  return serializeUser(user);
}

async function deleteUser(userId, currentUser) {
  const user = await getUser(userId);

  if (currentUser?.id === user.id) {
    throw httpError(400, 'Vous ne pouvez pas supprimer votre propre compte.');
  }

  await user.update({ isActive: false });

  return {
    id: user.id,
    deleted: true,
  };
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
