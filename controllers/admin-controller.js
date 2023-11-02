const { GroupTour } = require('../models')

const adminController = {
  getGroupTours: (req, res, next) => {
    return GroupTour.findAll({
      raw: true
    })
      .then(groupTours => res.render('admin/group-tours', { groupTours }))
      .catch(err => next(err))
  },
  getGroupTourCreate: (req, res, next) => {
    return res.render('admin/create-group-tour')
  },
  postGroupTour: (req, res, next) => {
    const { name, city, departureDate, returnDate, duration, quantity, price, description, canBeCancel } = req.body
    if (!name) throw new Error('Group tour name is required!')

    return GroupTour.create({
      name,
      city,
      departureDate,
      returnDate,
      duration,
      quantity,
      price,
      description,
      canBeCancel
    })
      .then(() => {
        req.flash('success_messages', 'Group tour was successfully created')
        return res.redirect('/admin/group-tours')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
