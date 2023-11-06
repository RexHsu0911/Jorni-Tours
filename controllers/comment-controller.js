const { Comment, User, GroupTour } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const commentController = {
  postComment: (req, res, next) => {
    const { rating, text, groupTourId } = req.body
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
          groupTourId,
          userId
        })
      })
      .then(() => {
        req.flash('success_messages', 'Comment was successfully shared!')
        return res.redirect(`/group-tours/${groupTourId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = commentController
