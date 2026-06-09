'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_roles', {
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
      name: {
        allowNull: false,
        type: Sequelize.STRING(120),
      },
      public_token: {
        allowNull: false,
        type: Sequelize.STRING(80),
        unique: true,
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('access_roles', ['event_id', 'name'], {
      name: 'access_roles_event_id_name_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('access_roles');
  },
};
