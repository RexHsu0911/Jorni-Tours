'use strict'
const { User } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const users = await User.findAll({ attributes: ['id'], transaction })

      // 只允許儲存唯一組合的 Set 集合
      const uniqueCombinations = new Set()

      await queryInterface.bulkInsert('Followships',
        Array.from({ length: 4 }, () => {
          let followerId, followingId

          do {
            // 生成隨機組合
            followerId = users[Math.floor(Math.random() * users.length)].id
            followingId = users[Math.floor(Math.random() * users.length)].id
            // 直到找到唯一且值不相同(不能追蹤自己)的組合(集合內沒有重複元素)
          } while (followerId === followingId || uniqueCombinations.has(`${followerId}-${followingId}`))

          // 新增元素
          uniqueCombinations.add(`${followerId}-${followingId}`)

          return {
            follower_id: followerId,
            following_id: followingId,
            created_at: new Date(),
            updated_at: new Date()
          }
        }), { transaction }
      )

      await transaction.commit()
    } catch (error) {
      console.error('Error occurred:', error.message)
      if (transaction) await transaction.rollback()
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Followships', {})
  }
}
