'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING(160),
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(180),
      },
      password_hash: {
        allowNull: false,
        type: Sequelize.STRING(255),
      },
      role: {
        allowNull: false,
        defaultValue: 'admin',
        type: Sequelize.STRING(40),
      },
      is_active: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
