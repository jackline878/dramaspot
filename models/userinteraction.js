'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInteraction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserInteraction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      UserInteraction.belongsTo(models.Article, {
        foreignKey: 'article_id',
        as: 'article'
      });
    }
  }
  UserInteraction.init({
    user_id: DataTypes.INTEGER,
    article_id: DataTypes.INTEGER,
    interaction_type: DataTypes.STRING,
    device: DataTypes.STRING,
    ip_address: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'UserInteraction',
  });
  return UserInteraction;
};