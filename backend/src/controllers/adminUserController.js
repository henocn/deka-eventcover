const userService = require('../services/userService');

async function listUsers(req, res) {
  const users = await userService.listUsers();
  res.json({ data: users });
}

async function createUser(req, res) {
  const user = await userService.createUser(req.validated.body);
  res.status(201).json({ data: user });
}

async function updateUser(req, res) {
  const user = await userService.updateUser(
    req.validated.params.userId,
    req.validated.body,
    req.user
  );
  res.json({ data: user });
}

async function deleteUser(req, res) {
  const result = await userService.deleteUser(req.validated.params.userId, req.user);
  res.json({ data: result });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
