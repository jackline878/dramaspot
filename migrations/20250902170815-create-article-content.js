'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArticleContents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      articleId: {
        type: Sequelize.INTEGER
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('head', 'text', 'list', 'quote', 'carousel', 'image', 'video', 'audio', 'embed', 'html', 'table', 'code', 'button', 'form', 'gallery', 'map', 'poll', 'slider', 'ad', 'countdown', 'faq', 'testimonial', 'timeline', 'stat', 'cta', 'announcement', 'infobox', 'drop-button')
      },
      content: {
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
    await queryInterface.dropTable('ArticleContents');
  }
};