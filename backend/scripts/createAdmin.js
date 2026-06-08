const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function createAdmin() {
  const fullName = process.env.ADMIN_FULL_NAME || 'Administrateur';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required in backend/.env');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user, created] = await User.findOrCreate({
    where: { email: email.toLowerCase() },
    defaults: {
      fullName,
      passwordHash,
      role: 'super_admin',
      isActive: true,
    },
  });

  if (!created) {
    await user.update({
      fullName,
      passwordHash,
      role: 'super_admin',
      isActive: true,
    });
  }

  console.log(created ? 'Admin user created' : 'Admin user updated');
}

createAdmin()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error(error);
    await sequelize.close();
    process.exit(1);
  });
