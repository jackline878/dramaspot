'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SectionContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     *      */
    static associate(models) {
      // define association here
      SectionContent.belongsTo(models.Section, { foreignKey: 'sectionId', as: 'section' });
    }
  }
  SectionContent.init({
    sectionId: DataTypes.INTEGER,
    type: DataTypes.ENUM('head', 'text', 'list', 'quote', 'carousel', 'image', 'video', 'audio', 'embed', 'html', 'table', 'code', 'button', 'form', 'gallery', 'map', 'poll', 'slider', 'ad', 'countdown', 'faq', 'testimonial', 'timeline', 'stat', 'cta', 'announcement', 'infobox'),
    content: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'SectionContent',
  });
  return SectionContent;
};