'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('Articles', 'keywords', {
        type: Sequelize.STRING,
        allowNull: true,
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Articles', 'keywords')
    ]);
  }
};