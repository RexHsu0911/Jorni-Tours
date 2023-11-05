const { GroupTour, Category } = require('../models')

const groupTourController = {
  getGroupTours: (req, res) => {
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
  }
}

module.exports = groupTourController
