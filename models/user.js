'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      User.hasMany(models.Comment, { foreignKey: 'userId' })
      User.belongsToMany(models.GroupTour, { // 多對多關係
        through: models.Favorite,
        foreignKey: 'userId',
        as: 'FavoritedGroupTours'
      })
      User.belongsToMany(User, {
        through: models.Followship,
        foreignKey: 'followingId',
        as: 'Followers' // User 的追蹤者
      })
      User.belongsToMany(User, {
        through: models.Followship,
        foreignKey: 'followerId',
        as: 'Followings' // User 追蹤中的 User
      })
      User.hasMany(models.Order, { foreignKey: 'userId' })
    }
  }
  // 定義欄位
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    gender: DataTypes.STRING,
    birthday: DataTypes.STRING,
    country: DataTypes.STRING,
    phone: DataTypes.STRING,
    avatar: DataTypes.STRING,
    description: DataTypes.TEXT,
    isAdmin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // 避免查詢資料時觸發大小寫混亂的問題(自動生成小寫的 users 會發生錯誤)
    underscored: true // 轉換成 snack_case 命名(避開大小寫的問題)
  })
  return User
}
