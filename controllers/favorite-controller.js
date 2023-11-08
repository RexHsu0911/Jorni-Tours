const { Favorite, GroupTour } = require('../models')
const favorite = require('../models/favorite')

const favoriteController = {
  addFavorite: (req, res, next) => {
    const { groupTourId } = req.params
    const userId = req.user.id

    return Promise.all([
      GroupTour.findByPk(groupTourId),
      Favorite.findOne({
        where: {
          userId,
          groupTourId
        }
      })
    ])
      .then(([groupTour, favorite]) => {
        if (!groupTour) throw new Error("Group tour didn't exist!")
        if (favorite) throw new Error('You have favorited this group tour!')

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
  }
}

module.exports = favoriteController
