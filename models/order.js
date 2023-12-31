'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Order.belongsToMany(models.GroupTour, {
        through: models.OrderItem,
        foreignKey: 'orderId',
        as: 'OrderedGroupTours'
      })
      Order.belongsTo(models.User, { foreignKey: 'userId' })
      Order.hasMany(models.Payment, { foreignKey: 'orderId' })
      Order.hasMany(models.Comment, { foreignKey: 'orderId' })
    }
  }
  Order.init({
    sn: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    country: DataTypes.STRING,
    phone: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    totalPrice: DataTypes.INTEGER,
    orderStatus: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    underscored: true
  })
  return Order
}
