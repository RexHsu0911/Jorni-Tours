'use strict'
const { Order } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const orders = await Order.findAll({ attributes: ['id', 'sn', 'paymentStatus'] }, transaction)

      const paymentTypeOptions = ['CREDIT', 'VACC', 'WEBATM']
      const insertPromises = []

      Array.from({ length: 2 }).forEach((_, i) => {
        Array.from({ length: 3 }).forEach(async (_, j) => {
          const currentOrder = orders[i * 3 + j]
          const paymentType = paymentTypeOptions[j]

          if (currentOrder.paymentStatus !== '0') {
            insertPromises.push(
              queryInterface.bulkInsert('Payments', [
                {
                  sn: currentOrder.sn,
                  payment_type: paymentType,
                  payment_status: currentOrder.paymentStatus,
                  order_id: currentOrder.id,
                  created_at: new Date(),
                  updated_at: new Date()
                }
              ], { transaction })
            )
          }
        })
      })

      await Promise.all(insertPromises)

      await transaction.commit()
    } catch (error) {
      console.error('Error occurred:', error.message)
      if (transaction) await transaction.rollback()
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', {})
  }
}
