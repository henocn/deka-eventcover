'use strict';

/** Ajoute le nombre de participants declare sur un evenement. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'participants_count', {
      allowNull: true,
      type: Sequelize.INTEGER,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'participants_count');
  },
};
