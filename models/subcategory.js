'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subcategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Subcategory.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });

      Subcategory.belongsToMany(models.Article, {
        through: 'ArticleCategory', // Join table
        foreignKey: 'sub_category_id',
        otherKey: 'article_id',
        as: 'articles'
      });

    }
  }

  Subcategory.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Subcategory',
  });
  return Subcategory;
};