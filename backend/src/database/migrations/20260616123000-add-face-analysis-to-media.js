'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('media', 'face_analysis_status', {
      allowNull: false,
      defaultValue: 'pending',
      type: Sequelize.STRING(40),
    });

    await queryInterface.addColumn('media', 'face_analysis_error', {
      allowNull: true,
      type: Sequelize.TEXT,
    });

    await queryInterface.addIndex('media', ['face_analysis_status'], {
      name: 'media_face_analysis_status_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('media', 'media_face_analysis_status_index');
    await queryInterface.removeColumn('media', 'face_analysis_error');
    await queryInterface.removeColumn('media', 'face_analysis_status');
  },
};
