'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId' })
      Cart.belongsToMany(models.GroupTour, {
        through: models.CartItem,
        foreignKey: 'cartId',
        as: 'cartedGroupTours'
      })
    }
  }
  Cart.init({
    amount: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
    underscored: true
  })
  return Cart
}
