'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visitor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Visitor.init({
    ip: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    location: DataTypes.STRING,
    page: DataTypes.STRING,
    visitDate: DataTypes.DATEONLY,
    frequency: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Visitor',
  });
  return Visitor;
};