'use strict'
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('GroupTours',
      Array.from({ length: 50 }, () => {
        const departureDate = faker.date.soon(180)
        const randomDays = Math.floor(Math.random() * 6 + 5) // 5 ~ 10
        // new Date() 毫秒轉為日期
        // getTime() 從1970年1月1日以來計算的毫秒
        const returnDate = new Date(departureDate.getTime() + (randomDays * 24 * 60 * 60 * 1000)) // 天數轉換為毫秒

        return {
          name: faker.address.country(),
          city: faker.address.city(),
          departure_date: departureDate.toISOString().substring(0, 10),
          return_date: returnDate.toISOString().substring(0, 10),
          duration: String(randomDays),
          description: faker.lorem.text(),
          image: `https://loremflickr.com/320/240/tourist,attractions/?random=${Math.random() * 100}`, // LoremFlickr 圖庫 API
          quantity: faker.datatype.number({ min: 10, max: 30 }),
          price: `${faker.commerce.price(200, 1200, 0) * 100}`,
          rating: faker.datatype.float({ min: 0, max: 5, precision: 0.1 }),
          can_be_cancel: faker.datatype.boolean(0.5),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    )
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('GroupTours', {})
  }
}
