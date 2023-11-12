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
        through: {
          model: models.CartItem,
          unique: false // 不具唯一束縛性(可重複)
        },
        foreignKey: 'cartId',
        as: 'cartedGroupTours'
      })
    }
  }
  Cart.init({
    amount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
    underscored: true
  })
  return Cart
}
