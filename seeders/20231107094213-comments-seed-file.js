'use strict'
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let transaction

    try {
      // transaction 確保資料庫操作的一致性
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

      await queryInterface.bulkInsert('Comments',
        Array.from({ length: 50 }, () => ({
          text: faker.lorem.sentence(),
          rating: faker.datatype.float({ min: 1, max: 5, precision: 0.1 }),
          image: faker.datatype.boolean(0.3) ? `https://loremflickr.com/320/240/tourist/?random=${Math.floor(Math.random() * 100 + 1)}` : null,
          user_id: users[Math.floor(Math.random() * users.length)].id,
          group_tour_id: groupTours[Math.floor(Math.random() * groupTours.length)].id,
          created_at: new Date(),
          updated_at: new Date()
        })), { transaction }
      )

      await transaction.commit()
      // 先產生資料，再進行資料的計算
      transaction = await queryInterface.sequelize.transaction()

      // for 迴圈遍歷 groupTours 陣列中的每個 GroupTours
      for (const groupTour of groupTours) {
        // 取出各 GroupTours 的 id
        const groupTourId = groupTour.id
        if (groupTourId) {
        // 計算各 groupTourId 所有 Comments 給予的 rating 平均值
          const result = await queryInterface.sequelize.query(
            'SELECT ROUND(AVG(rating), 1) as avg_rating FROM Comments WHERE group_tour_id = ?', // AVG 平均值;ROUND(..., 1) 四捨五入到小數點後一位
            {
              replacements: [groupTourId], // 替換到 SQL 查詢的語句(?)中
              type: queryInterface.sequelize.QueryTypes.SELECT,
              transaction
            }
          )

          // 取出計算後的 rating 平均值
          const avgRating = result[0].avg_rating
          // console.log(result)
          // 判斷 Comments 的 rating 存在
          if (avgRating) {
          // 更新 GroupTours 的 rating
            await queryInterface.sequelize.query(
              'UPDATE GroupTours SET rating = ? WHERE id = ?',
              {
                replacements: [avgRating, groupTourId],
                type: queryInterface.sequelize.QueryTypes.UPDATE,
                transaction
              }
            )
          }
        }
      }

      // 操作成功則提交 commit()，否則取消 rollback() 還原資料庫
      await transaction.commit()
    } catch (error) {
      console.error('Error occurred:', error.message)
      if (transaction) await transaction.rollback()
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', {})
  }
}
