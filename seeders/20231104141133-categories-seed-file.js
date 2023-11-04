'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories',
      ['Japan', 'Korea', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore'].map(item => {
        return {
          name: item,
          image: `https://loremflickr.com/320/240/tourist,attractions/?random=${Math.floor(Math.random() * 100 + 1)}`,
          created_at: new Date(),
          updated_at: new Date()
        }
      }), {})
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', {})
  }
}
