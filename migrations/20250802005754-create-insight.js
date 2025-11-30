'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Insights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      celebrityId: {
        type: Sequelize.INTEGER
      },
      careerStatus: {
        type: Sequelize.STRING
      },
      careerStart: {
        type: Sequelize.STRING
      },
      careerBreakthrough: {
        type: Sequelize.STRING
      },
      careerAchievements: {
        type: Sequelize.JSON
      },
      careerTimeline: {
        type: Sequelize.JSON
      },
      albums: {
        type: Sequelize.JSON
      },
      concerts: {
        type: Sequelize.JSON
      },
      brands: {
        type: Sequelize.JSON
      },
      awards: {
        type: Sequelize.JSON
      },
      nominations: {
        type: Sequelize.JSON
      },
      records: {
        type: Sequelize.JSON
      },
      awardGallery: {
        type: Sequelize.JSON
      },
      children: {
        type: Sequelize.JSON
      },
      family: {
        type: Sequelize.TEXT('long')
      },
      partner: {
        type: Sequelize.STRING
      },
      friends: {
        type: Sequelize.JSON
      },
      personalInsights: {
        type: Sequelize.JSON
      },
      assets: {
        type: Sequelize.JSON
      },
      philanthropy: {
        type: Sequelize.JSON
      },
      news: {
        type: Sequelize.JSON
      },
      funFacts: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Insights');
  }
};