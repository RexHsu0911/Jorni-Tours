const { GroupTour, Category } = require('../models')

const groupTourController = {
  getGroupTours: (req, res, next) => {
    // 從網址上查詢參數 categoryId 是字串，先轉成 Number 再操作
    const categoryId = Number(req.query.categoryId) || ''

    return Promise.all([
      GroupTour.findAll({
        raw: true,
        nest: true,
        include: [Category],
        where: {
          ...categoryId ? { categoryId } : {} // 檢查 categoryId 是否為空值
        }
      }),
      Category.findAll({ raw: true })
    ])
      .then(([groupTours, categories]) => {
        if (!groupTours) throw new Error("Group tours didn't exist!")
        if (!categories) throw new Error("Categories didn't exist!")

        const result = groupTours.map(t => ({
          ...t, // ... 展開運算子
          description: t.description.substring(0, 50) // substring 截取字串
        }))
        return res.render('group-tours', {
          groupTours: result,
          categories,
          categoryId
        })
      })
      .catch(err => next(err))
  },
  getGroupTour: (req, res, next) => {
    return GroupTour.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(groupTour => {
        if (!groupTour) throw new Error("Group tour didn't exist!")
        return res.render('group-tour', { groupTour })
      })
      .catch(err => next(err))
  }
}

module.exports = groupTourController
