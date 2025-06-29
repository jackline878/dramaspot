'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Follower extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
  Follower.belongsTo(models.User, { foreignKey: 'follower_id', as: 'Followers' });
  // A followed user also belongs to a user
  Follower.belongsTo(models.User, { foreignKey: 'followed_id', as: 'Followings' });
    }
  }
  Follower.init({
    follower_id: DataTypes.UUID,
    followed_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Follower',
  });
  return Follower;
};