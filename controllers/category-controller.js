const { Category } = require('../models')

const categoryController = {
  getCategories: async (req, res, next) => {
    try {
      const [categories, category] = await Promise.all([
        Category.findAll({ raw: true }),
        // id 是否存在(合併 edit category page)
        req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
      ])

      if (!categories) throw new Error("Categories didn't exist!")

      return res.render('admin/categories', { categories, category })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postCategory: async (req, res, next) => {
    try {
      const { name } = req.body

      if (!name) throw new Error('Category name is required!')

      await Category.create({ name })

      req.flash('success_messages', 'Category was successfully created!')
      res.redirect('/admin/categories')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  putCategory: async (req, res, next) => {
    try {
      const { name } = req.body

      if (!name) throw new Error('Category name is required!')

      const category = await Category.findByPk(req.params.id)

      if (!category) throw new Error("Category didn't exist!")

      await category.update({ name })

      req.flash('success_messages', 'Category was successfully updated!')
      return res.redirect('/admin/categories')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      const category = await Category.findByPk(req.params.id)

      if (!category) throw new Error("Category didn't exist!")

      await category.destroy()

      req.flash('success_messages', 'Category was successfully deleted!')
      return res.redirect('/admin/categories')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = categoryController
