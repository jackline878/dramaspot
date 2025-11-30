'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArticleContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     *      */
    static associate(models) {
      // define association here
      ArticleContent.belongsTo(models.Article, { foreignKey: 'articleId', as: 'article' });
    }
  }
  ArticleContent.init({
    articleId: DataTypes.INTEGER,
    order: DataTypes.INTEGER,
    type: DataTypes.ENUM('head', 'text', 'list', 'quote', 'carousel', 'image', 'video', 'audio', 'embed', 'html', 'table', 'code', 'button', 'form', 'gallery', 'map', 'poll', 'slider', 'ad', 'countdown', 'faq', 'testimonial', 'timeline', 'stat', 'cta', 'announcement', 'infobox', 'drop-button'),
    content: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'ArticleContent',
  });
  return ArticleContent;
};