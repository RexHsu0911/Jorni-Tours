const { GroupTour } = require('../models')

const adminController = {
  getGroupTours: (req, res, next) => {
    return GroupTour.findAll({
      raw: true
    })
      .then(groupTours => res.render('admin/group-tours', { groupTours }))
      .catch(err => next(err))
  }
}

module.exports = adminController
