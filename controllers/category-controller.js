const { Category } = require('../models')

const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      // id 是否存在(合併 edit category page)
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        if (!categories) throw new Error("Categories didn't exist!")
        return res.render('admin/categories', {
          categories,
          category
        })
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')

    return Category.create({ name })
      .then(() => {
        req.flash('success_messages', 'Category was successfully created!')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')

    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!")
        return category.update({ name })
      })
      .then(() => {
        req.flash('success_messages', 'Category was successfully updated!')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!")
        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', 'Category was successfully deleted!')
        return res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
