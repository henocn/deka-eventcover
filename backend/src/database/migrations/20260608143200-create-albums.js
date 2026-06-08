'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('albums', {
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
      title: {
        allowNull: false,
        type: Sequelize.STRING(180),
      },
      slug: {
        allowNull: false,
        type: Sequelize.STRING(180),
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      cover_media_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      sort_order: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      is_published: {
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

    await queryInterface.addIndex('albums', ['event_id', 'slug'], {
      unique: true,
      name: 'albums_event_id_slug_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('albums');
  },
};
