const { Comment, User, GroupTour } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const commentController = {
  postComment: async (req, res, next) => {
    try {
      const { rating, text, groupTourId, orderId } = req.body
      const { file } = req
      const userId = req.user.id

      if (!text) throw new Error('Comment text is required!')

      const [groupTour, filePath, user] = await Promise.all([
        GroupTour.findByPk(groupTourId),
        imgurFileHandler(file),
        User.findByPk(userId)
      ])

      if (!groupTour) throw new Error("GroupTour didn't exist!")
      if (!user) throw new Error("User didn't exist!")

      await Comment.create({
        rating,
        text,
        image: filePath || null,
        userId,
        groupTourId,
        orderId
      })

      req.flash('success_messages', 'Comment was successfully shared!')
      return res.redirect(`/orders/${orderId}/comment?groupTourId=${groupTourId}`)
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const comment = await Comment.findByPk(req.params.id)

      if (!comment) throw new Error("Comment didn't exist!")

      await comment.destroy()

      req.flash('success_messages', 'Comment was successfully deleted!')
      return res.redirect(`/group-tours/${comment.groupTourId}`)
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = commentController
