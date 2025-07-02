'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      likeable_id: {
        type: Sequelize.INTEGER
      },
      likeable_type: {
        type: Sequelize.STRING
      },

      reaction_type: {
        type: Sequelize.ENUM('like', 'dislike', 'love', 'angry', 'sad', 'wow'),
        allowNull: false,
        defaultValue: 'like' // Default reaction type
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
    await queryInterface.dropTable('Likes');
  }
};