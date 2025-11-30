'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('Celebrities', 'link', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Celebrities', 'facebook', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Celebrities', 'twitter', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Celebrities', 'instagram', {
        type: Sequelize.STRING,
        allowNull: true,
      }),

      queryInterface.addColumn('Celebrities', 'linkedin', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Celebrities', 'tiktok', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Celebrities', 'youtube', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Celebrities', 'link'),
      queryInterface.removeColumn('Celebrities', 'facebook'),
      queryInterface.removeColumn('Celebrities', 'twitter'),
      queryInterface.removeColumn('Celebrities', 'instagram'),
      queryInterface.removeColumn('Celebrities', 'linkedin'),
      queryInterface.removeColumn('Celebrities', 'tiktok'),
      queryInterface.removeColumn('Celebrities', 'youtube'),
    ]);
  }
};