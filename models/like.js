'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Like.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      Like.belongsTo(models.Article, {
        foreignKey: 'likeable_id',
        constraints: false,
        scope: {
          likeable_type: 'Article'
        },
        as: 'article'
      });
      
      Like.belongsTo(models.Comment, {
        foreignKey: 'likeable_id',
        constraints: false,
        scope: {
          likeable_type: 'Comment'
        },
        as: 'comment'
      });
    }
  }
  Like.init({
    user_id: DataTypes.INTEGER,
    likeable_id: DataTypes.INTEGER,
    likeable_type: DataTypes.STRING,
    reaction_type: DataTypes.ENUM('like', 'dislike', 'love', 'angry', 'sad', 'wow'),
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};