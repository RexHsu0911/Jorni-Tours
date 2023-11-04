'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: await bcrypt.hash('12345678', 10),
      is_admin: true,
      first_name: 'root',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user1@example.com',
      password: await bcrypt.hash('12345678', 10),
      is_admin: false,
      first_name: 'user',
      last_name: '1',
      gender: faker.name.gender(true),
      birthday: faker.date.past(65).toISOString().substring(0, 10), // 格式 date轉 string
      country: faker.address.country(),
      phone: faker.phone.phoneNumberFormat(),
      avatar: `https://loremflickr.com/300/300/person,face?random=${Math.floor(Math.random() * 100 + 1)}`,
      description: faker.lorem.text(),
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user2@example.com',
      password: await bcrypt.hash('12345678', 10),
      is_admin: false,
      first_name: 'user',
      last_name: '2',
      gender: faker.name.gender(true),
      birthday: faker.date.past(65).toISOString().substring(0, 10),
      country: faker.address.country(),
      phone: faker.phone.phoneNumberFormat(),
      avatar: `https://loremflickr.com/300/300/person,face?random=${Math.floor(Math.random() * 100 + 1)}`,
      description: faker.lorem.text(),
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
}
