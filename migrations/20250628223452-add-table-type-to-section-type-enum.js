'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('SectionContents', 'type', {
      type: Sequelize.ENUM(
        'head', 'text', 'list', 'quote', 'carousel', 'image', 'video', 'audio', 'embed', 'html',
        'table', 'code', 'button', 'form', 'gallery', 'map', 'poll', 'slider', 'ad', 'countdown',
        'faq', 'testimonial', 'timeline', 'stat', 'cta', 'announcement', 'infobox'
      )
    });
  },

  async down (queryInterface, Sequelize) {
    // Optionally, revert to previous set of ENUM values
  }
};
