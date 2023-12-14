'use strict'
const { GroupTour, Order } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const groupTours = await GroupTour.findAll({ attributes: ['id', 'price'] }, transaction)

      const orders = await Order.findAll({ attributes: ['id'] }, transaction)

      const insertPromises = []

      Array.from({ length: 2 }).forEach((_, i) => {
        Array.from({ length: 3 }).forEach(async (_, j) => {
          const currentGroupTour = groupTours[j + 1]

          insertPromises.push(
            queryInterface.bulkInsert('OrderItems', [
              {
                quantity: 2,
                price: currentGroupTour.price,
                order_id: orders[i * 3 + j].id,
                group_tour_id: currentGroupTour.id,
                created_at: new Date(),
                updated_at: new Date()
              }
            ], { transaction })
          )
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
    await queryInterface.bulkDelete('OrderItems', {})
  }
}
