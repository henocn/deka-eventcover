'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media_stats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      event_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      album_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'albums',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      media_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'media',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING(40),
      },
      ip_hash: {
        allowNull: true,
        type: Sequelize.STRING(120),
      },
      user_agent: {
        allowNull: true,
        type: Sequelize.STRING(500),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('media_stats', ['event_id', 'action']);
    await queryInterface.addIndex('media_stats', ['media_id', 'action']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('media_stats');
  },
};
