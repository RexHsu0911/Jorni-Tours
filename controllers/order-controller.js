const { Cart, GroupTour, User } = require('../models')

const orderController = {
  getOrder: (req, res, next) => {
    return Promise.all([
      Cart.findByPk(req.session.cartId, {
        include: [
          { model: GroupTour, as: 'cartedGroupTours' }
        ]
      }),
      User.findByPk(req.user.id, { raw: true })
    ])
      .then(([cart, user]) => {
        cart = cart ? cart.toJSON() : { cartedGroupTours: [] }
        const totalPrice = cart.cartedGroupTours.length > 0
          ? cart.cartedGroupTours
            .map(cgt => (cgt.price * cgt.CartItem.quantity))
            .reduce((a, b) => a + b)
          : 0

        return res.render('order', {
          cart,
          totalPrice,
          user
        })
      })
      .catch(err => next(err))
  }
}

module.exports = orderController
