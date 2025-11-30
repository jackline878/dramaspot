'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMetadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    ChatMetadata.belongsTo(models.Chat, { foreignKey: 'chat_id', onDelete: 'CASCADE' });
    ChatMetadata.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }
  }
  ChatMetadata.init({
    chat_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    is_deleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ChatMetadata',
  });
  return ChatMetadata;
};