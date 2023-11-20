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
      Order.belongsTo(models.User, { foreignKey: 'orderId' })
      Order.hasMany(models.Payment, { foreignKey: 'orderId' })
    }
  }
  Order.init({
    sn: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    country: DataTypes.STRING,
    phone: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    confirmPrice: DataTypes.INTEGER,
    orderStatus: DataTypes.BOOLEAN,
    paymentStatus: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    underscored: true
  })
  return Order
}
