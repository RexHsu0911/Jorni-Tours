const { Comment, User, GroupTour } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const commentController = {
  postComment: (req, res, next) => {
    const { rating, text, groupTourId, orderId } = req.body
    if (!text) throw new Error('Comment text is required!')
    const { file } = req
    const userId = req.user.id

    return Promise.all([
      GroupTour.findByPk(groupTourId),
      imgurFileHandler(file),
      User.findByPk(userId)
    ])
      .then(([groupTour, filePath, user]) => {
        if (!groupTour) throw new Error("GroupTour didn't exist!")
        if (!user) throw new Error("User didn't exist!")

        return Comment.create({
          rating,
          text,
          image: filePath || null,
          userId,
          groupTourId,
          orderId
        })
      })
      .then(() => {
        req.flash('success_messages', 'Comment was successfully shared!')
        return res.redirect(`/orders/${orderId}/comment?groupTourId=${groupTourId}`)
      })
      .catch(err => next(err))
  },
  deleteComment: (req, res, next) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.destroy()
      })
      .then(comment => {
        req.flash('success_messages', 'Comment was successfully deleted!')
        return res.redirect(`/group-tours/${comment.groupTourId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = commentController
