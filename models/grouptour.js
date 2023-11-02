'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class GroupTour extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  GroupTour.init({
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    departureDate: DataTypes.STRING,
    returnDate: DataTypes.STRING,
    duration: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    quantity: DataTypes.STRING,
    price: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    canBeCancel: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupTour',
    tableName: 'GroupTours',
    underscored: true
  })
  return GroupTour
}
