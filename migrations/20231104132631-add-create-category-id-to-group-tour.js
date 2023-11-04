'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('GroupTours', 'categoryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('GroupTours', 'categoryId')
  }
}
