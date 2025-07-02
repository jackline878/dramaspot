'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     */
    static associate(models) {
      // define association here  
      User.hasMany(models.Article, {
        foreignKey: 'userId',
        as: 'articles'
      });
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });
      User.hasMany(models.Like, {
        foreignKey: 'user_id',
        as: 'likes'
      });
      User.hasMany(models.UserInteraction, {
        foreignKey: 'user_id',
        as: 'interactions'
      });

      User.hasMany(models.Follower, { as: 'Followers', foreignKey: 'followed_id' });
      User.hasMany(models.Follower, { as: 'Followings', foreignKey: 'follower_id' });
      User.hasMany(models.Notification, {
        foreignKey: 'target_id',
        as: 'receivedNotifications'
      });

      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'sentNotifications'
      });

      User.hasMany(models.Activity, {
        foreignKey: 'target_id',
        as: 'receivedActivities'
      });

      User.hasMany(models.Activity, {
        foreignKey: 'user_id',
        as: 'sentActivities'
      });

    }
  }
  User.init({
    role: DataTypes.ENUM(
      'admin',
      'editor_in_chief',
      'sub_editor',
      'content_writer',
      'fact_checker',
      'graphic_designer',
      'video_editor',
      'seo_expert',
      'social_media_manager',
      'user'
    ),
    celebrity_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    bio: DataTypes.TEXT,
    status: DataTypes.ENUM('active', 'inactive', 'banned'),
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profile_pic: DataTypes.STRING,
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tiktok: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};