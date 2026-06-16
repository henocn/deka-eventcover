'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('face_embeddings', {
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
      media_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'media',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      embedding: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
      box_x: {
        allowNull: true,
        type: Sequelize.FLOAT,
      },
      box_y: {
        allowNull: true,
        type: Sequelize.FLOAT,
      },
      box_width: {
        allowNull: true,
        type: Sequelize.FLOAT,
      },
      box_height: {
        allowNull: true,
        type: Sequelize.FLOAT,
      },
      confidence: {
        allowNull: true,
        type: Sequelize.FLOAT,
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

    await queryInterface.addIndex('face_embeddings', ['event_id'], {
      name: 'face_embeddings_event_id_index',
    });
    await queryInterface.addIndex('face_embeddings', ['album_id'], {
      name: 'face_embeddings_album_id_index',
    });
    await queryInterface.addIndex('face_embeddings', ['media_id'], {
      name: 'face_embeddings_media_id_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('face_embeddings');
  },
};
