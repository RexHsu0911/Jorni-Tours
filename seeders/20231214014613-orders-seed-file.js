'use strict'
const { User, GroupTour } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const users = await User.findAll({ attributes: ['id', 'firstName', 'lastName', 'country', 'phone'] }, transaction)

      const groupTours = await GroupTour.findAll({ attributes: ['price'] }, transaction)

      const paymentStatusOptions = ['0', '1', '-1']
      const insertPromises = []

      Array.from({ length: 2 }).forEach((_, i) => {
        const currentUser = users[i + 1]

        Array.from({ length: 3 }).forEach(async (_, j) => {
          const paymentStatus = paymentStatusOptions[j]
          const currentGroupTour = groupTours[j + 1]

          insertPromises.push(
            queryInterface.bulkInsert('Orders', [
              {
                sn: Math.round(new Date().getTime() / 1000 + (i * 3 + j)),
                first_name: currentUser.firstName,
                last_name: currentUser.lastName,
                country: currentUser.country,
                phone: currentUser.phone,
                amount: 1,
                total_price: currentGroupTour.price * 2,
                order_status: '1',
                payment_status: paymentStatus,
                user_id: currentUser.id,
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
    await queryInterface.bulkDelete('Orders', {})
  }
}
