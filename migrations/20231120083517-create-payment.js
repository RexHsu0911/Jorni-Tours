'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sn: {
        type: Sequelize.STRING
      },
      payment_type: {
        type: Sequelize.STRING
      },
      payment_status: {
        type: Sequelize.STRING
      },
      order_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments')
  }
}
