'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Celebrity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Celebrity.hasMany(models.Insight, { foreignKey: 'celebrityId' });
      Celebrity.hasMany(models.Extra, { foreignKey: 'celebrityId' });

    }
  }
  Celebrity.init({
    fullName: DataTypes.STRING,
    nickname: DataTypes.STRING,
    profilePic: DataTypes.STRING,
    coverPic: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    placeOfBirth: DataTypes.STRING,
    link: DataTypes.STRING,
    facebook: DataTypes.STRING,
    tiktok: DataTypes.STRING,
    instagram: DataTypes.STRING,
    youtube: DataTypes.STRING,
    twitter: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    networth: DataTypes.DECIMAL(20, 2),
    nationality: DataTypes.STRING,
    roles: DataTypes.JSON,
    careerBackground: DataTypes.TEXT,
    bio: DataTypes.TEXT,
    relationshipStatus: DataTypes.STRING,
    familyBackground: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Celebrity',
  });
  return Celebrity;
};