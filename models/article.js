'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // An article belongs to a category
      // models/article.js
      Article.belongsToMany(models.Subcategory, {
        through: 'ArticleCategory',
        foreignKey: 'article_id',
        otherKey: 'sub_category_id',
        as: 'subcategories'
      });



      Article.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
      // An article can have many sections
      // Each section belongs to an article
      Article.hasMany(models.Section, { foreignKey: 'articleId', as: 'sections' });
      // An article can have many comments
      // Each comment belongs to an article
      Article.hasMany(models.Comment, { foreignKey: 'article_id', as: 'comments' });
      // An article can have many likes
      // Each like belongs to an article
      Article.hasMany(models.Like, {
        foreignKey: 'likeable_id',
        constraints: false,
        scope: {
          likeable_type: 'Article'
        },
        as: 'likes'
      });

      // An article can have many user interactions
      // Each interaction belongs to an article
      Article.hasMany(models.UserInteraction, { foreignKey: 'article_id', as: 'interactions' });
      // An article can have many tags
      // Each tag belongs to an article
      Article.belongsToMany(models.Hashtag, {
        through: 'ArticleHashtag',
        foreignKey: 'article_id',
        as: 'hashtags'
      });

    }
  }
  Article.init({
    title: DataTypes.STRING,
    image: DataTypes.STRING,
    slug: DataTypes.STRING,
    published_at: DataTypes.DATE,
    read_duration: DataTypes.INTEGER,
    featured: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER,
    excerpt: DataTypes.TEXT,
    status: DataTypes.ENUM('published', 'draft')
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};