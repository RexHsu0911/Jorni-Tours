const { Favorite, GroupTour, User, Category, Comment } = require('../models')

const favoriteController = {
  addFavorite: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { groupTourId } = req.params

      const [favorite, isCreated] = await Favorite.findOrCreate({
        where: { userId, groupTourId }
      })
      // console.log(favorite)

      // 存在我的最愛中
      if (favorite && !isCreated) throw new Error('You have already favorited this group tour!')

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  removeFavorite: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { groupTourId } = req.params

      const favorite = await Favorite.findOne({
        where: { userId, groupTourId }
      })

      // 不存在我的最愛中
      if (!favorite) throw new Error("You haven't favorited this group tour!")

      await favorite.destroy()

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getFavorite: async (req, res, next) => {
    try {
      const userId = req.user.id
      const categoryId = Number(req.query.categoryId) || ''

      // 我的最愛中所有分類
      const categories = await User.findByPk(userId, {
        include: [
          {
            model: GroupTour,
            as: 'FavoritedGroupTours',
            include: Category
          }
        ]
      })
      // console.log(categories)

      // 我的最愛為空的
      if (!categories.FavoritedGroupTours.length) return res.render('users/favorite')

      // 下拉式選單取得不重複的分類
      const categoryDropdown = categories.FavoritedGroupTours.reduce((acc, groupTour) => {
        if (!acc.some(category => category.id === groupTour.Category.id)) {
          acc.push(groupTour.Category.toJSON())
        }
        return acc
      }, [])
      // console.log(categoryDropdown)

      // 選取分類
      let favorite = await User.findByPk(userId, {
        include: [
          {
            model: GroupTour,
            as: 'FavoritedGroupTours',
            include: Category,
            order: [['createdAt', 'DESC']],
            where: { ...categoryId ? { categoryId } : {} }
          }
        ]
      })

      favorite = favorite.toJSON()

      const result = favorite.FavoritedGroupTours.map(gt => ({
        ...gt,
        // 存在我的最愛中
        isFavorited: favorite.FavoritedGroupTours.some(fgt => fgt.id === gt.id)
      }))
      // console.log(result)

      return res.render('users/favorite', {
        favorite: result,
        categoryId,
        categoryDropdown
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = favoriteController
