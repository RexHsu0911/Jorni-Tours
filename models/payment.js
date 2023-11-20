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
      Payment.belongsTo(models.Order, { foreignKey: 'paymentId' })
    }
  }
  Payment.init({
    paymentMethod: DataTypes.STRING,
    params: DataTypes.STRING,
    paidAt: DataTypes.DATE,
    orderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
    underscored: true
  })
  return Payment
}
