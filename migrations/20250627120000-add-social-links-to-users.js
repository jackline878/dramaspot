'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('Users', 'facebook', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'twitter', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'instagram', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      
      queryInterface.addColumn('Users', 'linkedin', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'tiktok', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'youtube', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Users', 'facebook'),
      queryInterface.removeColumn('Users', 'twitter'),
      queryInterface.removeColumn('Users', 'instagram'),
      queryInterface.removeColumn('Users', 'linkedin'),
      queryInterface.removeColumn('Users', 'tiktok'),
      queryInterface.removeColumn('Users', 'youtube'),
    ]);
  }
};
