const { Followship, User } = require('../models')

const followController = {
  addFollow: async (req, res, next) => {
    try {
      const { userId } = req.params

      const [user, followship] = await Promise.all([
        User.findByPk(userId),
        Followship.findOne({
          where: {
            followerId: req.user.id,
            followingId: userId // 目前登入 user 的 following
          }
        })
      ])

      if (!user) throw new Error("User didn't exist!")
      if (followship) throw new Error('You have already followed this user!')

      await Followship.create({
        followerId: req.user.id,
        followingId: userId
      })

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  removeFollow: async (req, res, next) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })

      if (!followship) throw new Error("You have't followed this user!")

      await followship.destroy()

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = followController
