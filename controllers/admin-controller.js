const { GroupTour, User } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getGroupTours: (req, res, next) => {
    return GroupTour.findAll({
      raw: true
    })
      .then(groupTours => {
        if (!groupTours) throw new Error("Group tours didn't exist!")
        return res.render('admin/group-tours', { groupTours })
      })
      .catch(err => next(err))
  },
  getGroupTourCreate: (req, res, next) => {
    return res.render('admin/create-group-tour')
  },
  postGroupTour: (req, res, next) => {
    const { name, city, departureDate, returnDate, duration, quantity, price, description, canBeCancel } = req.body
    if (!name) throw new Error('Group tour name is required!')

    const { file } = req // 讀取檔案
    imgurFileHandler(file) // 檔案傳到 file-helper 處理
      .then(filePath => GroupTour.create({
        name,
        city,
        departureDate,
        returnDate,
        duration,
        quantity,
        price,
        description,
        canBeCancel,
        image: filePath || null
      }))
      .then(() => {
        req.flash('success_messages', 'Group tour was successfully created!')
        return res.redirect('/admin/group-tours')
      })
      .catch(err => next(err))
  },
  getGroupTour: (req, res, next) => {
    return GroupTour.findByPk(req.params.id, {
      raw: true
    })
      .then(groupTour => {
        if (!groupTour) throw new Error("Group tour didn't exist!")
        return res.render('admin/group-tour', { groupTour })
      })
      .catch(err => next(err))
  },
  getGroupTourEdit: (req, res, next) => {
    return GroupTour.findByPk(req.params.id, {
      raw: true
    })
      .then(groupTour => {
        if (!groupTour) throw new Error("Group tour didn't exist!")
        return res.render('admin/edit-group-tour', { groupTour })
      })
      .catch(err => next(err))
  },
  putGroupTour: (req, res, next) => {
    const { name, city, departureDate, returnDate, duration, quantity, price, description, canBeCancel } = req.body
    if (!name) throw new Error('Group tour name is required!')

    const { file } = req
    return Promise.all([ // 非同步處理
      GroupTour.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([groupTour, filePath]) => {
        if (!groupTour) throw new Error("Group tour didn't exist!")

        return groupTour.update({
          name,
          city,
          departureDate,
          returnDate,
          duration,
          quantity,
          price,
          description,
          canBeCancel,
          image: filePath || groupTour.image
        })
      })
      .then(() => {
        req.flash('success_messages', 'Group tour was successfully updated!')
        return res.redirect('/admin/group-tours')
      })
      .catch(err => next(err))
  },
  deleteGroupTour: (req, res, next) => {
    return GroupTour.findByPk(req.params.id)
      .then(groupTour => {
        if (!groupTour) throw new Error("Group tour didn't exist!")
        return groupTour.destroy()
      })
      .then(() => res.redirect('/admin/group-tours'))
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true
    })
      .then(users => {
        if (!users) throw new Error("Users didn't exist!")
        return res.render('admin/users', { users })
      })
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        if (user.email === 'root@example.com') throw new Error('Prohibit changing 「root」 permission!')

        return user.update({
          isAdmin: !user.isAdmin // 反值
        })
      })
      .then(() => res.redirect('/admin/users'))
      .catch(err => next(err))
  }
}

module.exports = adminController
