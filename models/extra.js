'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Extra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Extra.belongsTo(models.Celebrity, { foreignKey: 'celebrityId' });

    }
  }
  Extra.init({
    celebrityId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    key: DataTypes.STRING,
    value: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Extra',
  });
  return Extra;
};