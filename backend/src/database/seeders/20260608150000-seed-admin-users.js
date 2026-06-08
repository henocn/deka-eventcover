'use strict';

const bcrypt = require('bcryptjs');

const now = () => new Date();

module.exports = {
  async up(queryInterface) {
    const createdAt = now();
    const updatedAt = now();

    const users = [
      {
        full_name: 'Super ADMIN',
        email: (process.env.SEED_SUPER_ADMIN_EMAIL || 'super@gmail.com').toLowerCase(),
        password_hash: await bcrypt.hash(
          process.env.SEED_SUPER_ADMIN_PASSWORD || 'Super@123!',
          12
        ),
        role: 'super_admin',
        is_active: true,
        created_at: createdAt,
        updated_at: updatedAt,
      },
      {
        full_name: 'User ADMIN',
        email: (process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
        password_hash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123!', 12),
        role: 'admin',
        is_active: true,
        created_at: createdAt,
        updated_at: updatedAt,
      },
    ];

    await queryInterface.bulkInsert('users', users, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          (process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@example.com').toLowerCase(),
          (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
        ],
      },
    });
  },
};
