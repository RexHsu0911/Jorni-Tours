'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Comment.belongsTo(models.User, { foreignKey: 'userId' })
      Comment.belongsTo(models.GroupTour, { foreignKey: 'groupTourId' })
      Comment.belongsTo(models.Order, { foreignKey: 'orderId' })
    }
  }
  Comment.init({
    text: DataTypes.STRING,
    rating: DataTypes.FLOAT(2, 1),
    image: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    groupTourId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments',
    underscored: true
  })
  return Comment
}
