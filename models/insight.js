'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Insight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Insight.belongsTo(models.Celebrity, { foreignKey: 'celebrityId' });

    }
  }
  Insight.init({
    celebrityId: DataTypes.INTEGER,
    careerStatus: DataTypes.STRING,
    careerStart: DataTypes.STRING,
    careerBreakthrough: DataTypes.STRING,
    careerAchievements: DataTypes.JSON,
    careerTimeline: DataTypes.JSON,
    albums: DataTypes.JSON,
    concerts: DataTypes.JSON,
    brands: DataTypes.JSON,
    awards: DataTypes.JSON,
    nominations: DataTypes.JSON,
    records: DataTypes.JSON,
    awardGallery: DataTypes.JSON,
    children: DataTypes.JSON,
    partner: DataTypes.STRING,
    family: DataTypes.TEXT('long'),
    friends: DataTypes.JSON,
    personalInsights: DataTypes.JSON,
    assets: DataTypes.JSON,
    philanthropy: DataTypes.JSON,
    news: DataTypes.JSON,
    funFacts: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Insight',
  });
  return Insight;
};