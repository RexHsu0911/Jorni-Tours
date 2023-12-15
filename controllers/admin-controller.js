const { GroupTour, User, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getGroupTours: async (req, res, next) => {
    try {
      const groupTours = await GroupTour.findAll({
        include: Category,
        raw: true,
        nest: true
      })

      if (!groupTours) throw new Error("Group tours didn't exist!")

      return res.render('admin/group-tours', { groupTours })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getGroupTourCreate: async (req, res, next) => {
    try {
      const categories = await Category.findAll({
        raw: true
      })

      if (!categories) throw new Error("Categories didn't exist!")

      return res.render('admin/create-group-tour', { categories })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postGroupTour: async (req, res, next) => {
    try {
      const { name, city, departureDate, returnDate, duration, quantity, price, description, canBeCancel, categoryId } = req.body

      if (!name) throw new Error('Group tour name is required!')

      const filePath = await imgurFileHandler(req.file)

      await GroupTour.create({
        name,
        city,
        departureDate,
        returnDate,
        duration,
        quantity,
        price,
        description,
        canBeCancel,
        image: filePath || null,
        categoryId
      })

      req.flash('success_messages', 'Group tour was successfully created!')
      return res.redirect('/admin/group-tours')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getGroupTour: async (req, res, next) => {
    try {
      const groupTour = await GroupTour.findByPk(req.params.id, {
        include: Category,
        raw: true
      })

      if (!groupTour) throw new Error("Group tour didn't exist!")

      return res.render('admin/group-tour', { groupTour })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getGroupTourEdit: async (req, res, next) => {
    try {
      const [groupTour, categories] = await Promise.all([
        GroupTour.findByPk(req.params.id, { raw: true }),
        Category.findAll({ raw: true })
      ])

      if (!groupTour) throw new Error("Group tour didn't exist!")
      if (!categories) throw new Error("Category didn't exist!")

      return res.render('admin/edit-group-tour', { groupTour, categories })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  putGroupTour: async (req, res, next) => {
    try {
      const { name, city, departureDate, returnDate, duration, quantity, price, description, canBeCancel, categoryId } = req.body

      if (!name) throw new Error('Group tour name is required!')

      const [groupTour, filePath] = await Promise.all([
        GroupTour.findByPk(req.params.id),
        imgurFileHandler(req.file)
      ])

      if (!groupTour) throw new Error("Group tour didn't exist!")

      await groupTour.update({
        name,
        city,
        departureDate,
        returnDate,
        duration,
        quantity,
        price,
        description,
        canBeCancel,
        image: filePath || groupTour.image,
        categoryId
      })

      req.flash('success_messages', 'Group tour was successfully updated!')
      return res.redirect('/admin/group-tours')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  deleteGroupTour: async (req, res, next) => {
    try {
      const groupTour = await GroupTour.findByPk(req.params.id)

      if (!groupTour) throw new Error("Group tour didn't exist!")

      await groupTour.destroy()

      req.flash('success_messages', 'Group tour was successfully deleted!')
      return res.redirect('/admin/group-tours')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({ raw: true })

      if (!users) throw new Error("Users didn't exist!")

      return res.render('admin/users', { users })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  patchUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id)

      if (!user) throw new Error("User didn't exist!")
      if (user.email === 'root@example.com') throw new Error('Prohibit changing 「root」 permission!')

      await user.update({
        isAdmin: !user.isAdmin
      })

      req.flash('success_messages', 'User permission was successfully updated!')
      return res.redirect('/admin/users')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = adminController
