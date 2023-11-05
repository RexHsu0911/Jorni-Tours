const { GroupTour, Category } = require('../models')

const groupTourController = {
  getGroupTours: (req, res, next) => {
    return GroupTour.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(groupTours => {
        if (!groupTours) throw new Error("Group tours didn't exist!")

        const result = groupTours.map(t => ({
          ...t, // ... 展開運算子
          description: t.description.substring(0, 50) // substring 截取字串
        }))
        return res.render('group-tours', { groupTours: result })
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
