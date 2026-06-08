'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(180),
      },
      slug: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(180),
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      location: {
        allowNull: true,
        type: Sequelize.STRING(180),
      },
      starts_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      ends_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      access_code: {
        allowNull: true,
        type: Sequelize.STRING(80),
      },
      cover_media_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      is_published: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('events');
  },
};
