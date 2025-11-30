'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArticleHashtag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ArticleHashtag.init({
    article_id: DataTypes.INTEGER,
    hashtag_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ArticleHashtag',
  });
  return ArticleHashtag;
};