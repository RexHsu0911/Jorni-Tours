'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const users = await queryInterface.sequelize.query(
        'SELECT id FROM Users;',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      )

      const groupTours = await queryInterface.sequelize.query(
        'SELECT id FROM GroupTours;',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      )

      await queryInterface.bulkInsert('Favorites',
        Array.from({ length: 10 }, () => ({
          user_id: users[Math.floor(Math.random() * users.length)].id,
          group_tour_id: groupTours[Math.floor(Math.random() * groupTours.length)].id,
          created_at: new Date(),
          updated_at: new Date()
        })), { transaction }
      )

      await transaction.commit()
    } catch (error) {
      console.error('Error occurred:', error.message)
      if (transaction) await transaction.rollback()
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Favorites', {})
  }
}
