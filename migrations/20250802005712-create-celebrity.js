'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Celebrities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName: {
        type: Sequelize.STRING
      },
      nickname: {
        type: Sequelize.STRING
      },
      dateOfBirth: {
        type: Sequelize.DATE
      },
      placeOfBirth: {
        type: Sequelize.STRING
      },
      coverPic: {
        type: Sequelize.STRING
      },
      profilePic: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING
      },
      nationality: {
        type: Sequelize.STRING
      },
      networth: {
        type: Sequelize.DECIMAL(20, 2)
      },
      roles: {
        type: Sequelize.JSON
      },
      careerBackground: {
        type: Sequelize.TEXT
      },
      bio: {
        type: Sequelize.TEXT
      },
      relationshipStatus: {
        type: Sequelize.STRING
      },
      familyBackground: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Celebrities');
  }
};