'use strict'
const { User } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const users = await User.findAll({ attributes: ['id'], transaction })

      await queryInterface.bulkInsert('Carts', [
        {
        //   amount:
          user_id: users[1].id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          //   amount:
          user_id: users[2].id,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { transaction }
      )

      await transaction.commit()
    } catch (error) {
      console.error('Error occurred:', error.message)
      if (transaction) await transaction.rollback()
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Carts', {})
  }
}
