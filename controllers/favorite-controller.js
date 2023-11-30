const { Favorite, GroupTour, User, Category, Comment } = require('../models')

const favoriteController = {
  addFavorite: async (req, res, next) => {
    try {
      const { groupTourId } = req.params
      const userId = req.user.id

      const [favorite, isCreated] = await Favorite.findOrCreate({
        where: { userId, groupTourId }
      })
      console.log(favorite)

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
      const { groupTourId } = req.params
      const userId = req.user.id

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

      let favorite = await User.findByPk(userId, {
        include: [
          {
            model: GroupTour,
            as: 'FavoritedGroupTours',
            // through: Favorite,
            include: [
              // { model: User, as: 'FavoritedUsers' },
              Category,
              Comment
            ],
            order: [['createdAt', 'DESC']],
            where: {
              ...categoryId ? { categoryId } : {}
            }
          }
        ]
      })

      // 沒有我的最愛
      if (!favorite) return res.render('users/favorite')

      favorite = favorite.toJSON()

      const result = favorite.FavoritedGroupTours.map(gt => ({
        ...gt,
        ratedCount: gt.Comments.length,
        isFavorited: favorite.FavoritedGroupTours.some(fgt => fgt.id === gt.id)
      }))
      console.log(result)

      return res.render('users/favorite', {
        favorite: result,
        categoryId
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = favoriteController
