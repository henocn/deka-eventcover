'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media', {
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
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'albums',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(40),
      },
      mime_type: {
        allowNull: false,
        type: Sequelize.STRING(120),
      },
      original_name: {
        allowNull: false,
        type: Sequelize.STRING(255),
      },
      storage_path: {
        allowNull: false,
        type: Sequelize.STRING(500),
      },
      public_url: {
        allowNull: false,
        type: Sequelize.STRING(500),
      },
      size_bytes: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      width: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      height: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      sort_order: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      uploaded_by: {
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

    await queryInterface.addIndex('media', ['event_id', 'album_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('media');
  },
};
