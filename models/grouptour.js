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
      GroupTour.belongsTo(models.Category, { foreignKey: 'categoryId' }) // 多對一關係
      GroupTour.hasMany(models.Comment, { foreignKey: 'groupTourId' })
      GroupTour.belongsToMany(models.User, { // 多對多關係
        through: models.Favorite,
        foreignKey: 'groupTourId',
        as: 'FavoritedUsers'
      })
      GroupTour.belongsToMany(models.Cart, {
        through: models.CartItem,
        foreignKey: 'groupTourId',
        as: 'cartedGroupTours'
      })
      GroupTour.belongsToMany(models.Order, {
        through: models.OrderItem,
        foreignKey: 'groupTourId',
        as: 'OrderedGroupTours'
      })
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
    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    rating: DataTypes.FLOAT(2, 1), // FLOAT(n, m)，n=總位數，m=小數位數
    canBeCancel: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'GroupTour',
    tableName: 'GroupTours',
    underscored: true
  })
  return GroupTour
}
