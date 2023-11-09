const { Favorite, GroupTour, User, Category, Comment } = require('../models')

const favoriteController = {
  addFavorite: (req, res, next) => {
    const { groupTourId } = req.params
    const userId = req.user.id

    return Promise.all([
      GroupTour.findByPk(groupTourId),
      Favorite.findOne({
        where: {
          userId,
          groupTourId // 目前登入 user 的 groupTour
        }
      })
    ])
      .then(([groupTour, favorite]) => {
        if (!groupTour) throw new Error("Group tour didn't exist!")
        if (favorite) throw new Error('You have already favorited this group tour!')

        return Favorite.create({
          userId,
          groupTourId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        groupTourId: req.params.groupTourId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this group tour!")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getFavorite: (req, res, next) => {
    const { userId } = req.params
    if (req.user.id !== Number(userId)) throw new Error("Favorite didn't exist!")

    return User.findByPk(userId, {
      include: [
        {
          model: GroupTour,
          as: 'FavoritedGroupTours',
          through: Favorite,
          include: [
            { model: User, as: 'FavoritedUsers' },
            Category,
            Comment
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    })
      .then((user) => {
        if (!user) throw new Error("User didn't exist!")

        user = user.toJSON()
        const result = user.FavoritedGroupTours.map(gt => ({
          ...gt,
          ratedCount: gt.Comments.length,
          isFavorited: req.user?.FavoritedGroupTours.some(fgt => fgt.id === gt.id)
        }))
        console.log(result)

        return res.render('users/favorite-list', {
          user: result
        })
      })
      .catch(err => next(err))
  }
}

module.exports = favoriteController
