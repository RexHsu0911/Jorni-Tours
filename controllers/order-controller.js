const { Cart, GroupTour, User, Order, OrderItem, CartItem } = require('../models')
const faker = require('faker')
const snNum = faker.random.alphaNumeric(10) // 訂單編號

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
  },
  postOrder: (req, res, next) => {
    const { firstName, lastName, country, phone, cartId, amount, confirmPrice } = req.body

    return Cart.findByPk(cartId, {
      include: [
        { model: GroupTour, as: 'cartedGroupTours' }
      ]
    })
      .then(cart => {
        cart = cart ? cart.toJSON() : { cartedGroupTours: [] }
        console.log(cart)

        // 判斷 CartItem 存不存在
        if (!cart.cartedGroupTours.length) throw new Error("You don't have any item in your cart!")

        // 判斷 CartItem 的數量是否大於 GroupTour 的庫存數量
        for (const GroupTour of cart.cartedGroupTours) {
          if (GroupTour.CartItem.quantity > GroupTour.quantity) throw new Error(`Sorry, ${GroupTour.name} only has ${GroupTour.quantity} left, please choose the quantity of it again!`)
        }

        // 創建 Order
        return Order.create({
          userId: req.user.id,
          sn: snNum,
          firstName,
          lastName,
          country,
          phone,
          amount,
          confirmPrice,
          orderStatus: 1, // (0:已取消, 1:處理中）
          paymentStatus: 0 // (0:尚未付款, 1:已付款)
        })
          .then(order => {
            order = order.toJSON()

            cart.cartedGroupTours.forEach(item => {
              return Promise.all([
                // 建立與訂單有關的 OrderItem
                OrderItem.create({
                  orderId: order.id,
                  groupTourId: item.id,
                  price: item.price,
                  quantity: item.CartItem.quantity
                }),
                // 更新 GroupTour 庫存數量
                GroupTour.findByPk(item.id)
                  .then(groupTour => groupTour.update({
                    quantity: (groupTour.quantity -= item.CartItem.quantity)
                  }))
              ])
            })

            return order
          })
          .then(order => {
            // 訂購完成後，刪除與訂單有關的 CartItem
            CartItem.destroy({ where: { cartId: req.body.cartId } })

            return res.redirect(`/order/${order.id}/payment`)
          })
      })
      .catch(err => next(err))
  }
}

module.exports = orderController
