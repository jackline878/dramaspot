'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      Activity.belongsTo(models.User, {
        as: 'source',
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
    
      Activity.belongsTo(models.User, {
        as: 'target',
        foreignKey: 'target_id',
        onDelete: 'CASCADE'
      });
      
  }}

  Activity.init(
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      item_id: DataTypes.INTEGER,
      user_id: DataTypes.UUID,
      target_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Activity',
      tableName: 'Activities',
      timestamps: true,
    }
  );

  return Activity;
};
