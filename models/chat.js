'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Define associations.
     * This method is automatically called by the `models/index.js` file.
     */
    static associate(models) {
      // Chat belongs to the user who sent the message
      Chat.belongsTo(models.User, {
        as: 'Sender',
        foreignKey: 'sender_id',
        onDelete: 'CASCADE'
      });

      // Chat belongs to the user who received the message
      Chat.belongsTo(models.User, {
        as: 'Receiver',
        foreignKey: 'receiver_id',
        onDelete: 'CASCADE'
      });


      // Chat has many metadata records
      Chat.hasMany(models.ChatMetadata, {
        as: 'metadata',
        foreignKey: 'chat_id',
        onDelete: 'CASCADE'
      });
    }
  }

  Chat.init(
    {
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      receiver_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'Chat',
      tableName: 'Chats',
      timestamps: true
    }
  );

  return Chat;
};
