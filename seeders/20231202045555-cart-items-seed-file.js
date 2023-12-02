'use strict'
const { Cart, GroupTour } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const carts = await Cart.findAll({ attributes: ['id'], transaction })

      const groupTours = await GroupTour.findAll({ attributes: ['id'], transaction })

      const uniqueCombinations = new Set()

      // 遍歷購物車 id
      for (const cart of carts) {
        const cartId = cart.id

        // 各別創建3筆資料
        await queryInterface.bulkInsert('CartItems',
          Array.from({ length: 3 }, () => {
            let groupTourId

            do {
              groupTourId = groupTours[Math.floor(Math.random() * groupTours.length)].id
            } while (uniqueCombinations.has(`${cartId}-${groupTourId}`))

            uniqueCombinations.add(`${cartId}-${groupTourId}`)

            return {
              quantity: Math.floor(Math.random() * 10) + 1,
              cart_id: cartId,
              group_tour_id: groupTourId,
              created_at: new Date(),
              updated_at: new Date()
            }
          }), { transaction }
        )
      }

      await transaction.commit()
    } catch (error) {
      console.error('Error occurred:', error.message)
      if (transaction) await transaction.rollback()
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CartItems', {})
  }
}
