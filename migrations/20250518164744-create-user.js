'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      profile_pic: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      bio: {
        type: Sequelize.TEXT
      },
      celebrity_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      role: {
        type: Sequelize.ENUM(
  'admin',
  'editor_in_chief',
  'sub_editor',
  'content_writer',
  'fact_checker',
  'graphic_designer',
  'video_editor',
  'seo_expert',
  'social_media_manager',
  'user'
),
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active'
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Users');
  }
};