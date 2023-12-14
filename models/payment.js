'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Payment.belongsTo(models.Order, { foreignKey: 'orderId' })
    }
  }
  Payment.init({
    sn: DataTypes.STRING,
    paymentType: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    orderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
    underscored: true
  })
  return Payment
}
