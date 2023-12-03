const { Cart, GroupTour, User, Order, OrderItem, CartItem } = require('../models')
const { getTradeInfo } = require('../public/javascripts/payment')

const orderController = {
  getOrderCreate: async (req, res, next) => {
    try {
      const userId = req.user.id
      let cart = {}

      // 直接購買，query 取得商品參數
      const groupTourId = Number(req.query.groupTourId)
      const quantity = Number(req.query.quantity)

      // 商品頁面直接購買(有商品參數)
      if (groupTourId && quantity) {
        // 創建臨時性的購物車(userId = null)
        const temporaryCart = await Cart.create()

        await CartItem.create({
          cartId: temporaryCart.id,
          groupTourId,
          quantity
        })

        cart = await Cart.findByPk(temporaryCart.id, {
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ]
        })
        // 購物車頁面購買
      } else {
        cart = await Cart.findOne({
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ],
          where: { userId }
        })
      }

      cart = cart.toJSON()

      // 購物車不存在或為空的
      if (!cart || !cart.cartedGroupTours.length) {
        req.flash('warning_messages', 'Your shopping cart is empty. Please add products to your cart before placing an order!')
        return res.redirect('cart')
      }

      const result = {
        ...cart,
        totalPrice: cart.cartedGroupTours.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
      }
      console.log('使用者購物車:', cart.cartedGroupTours)

      // 填入使用者資料
      let user = await User.findByPk(userId)

      user = user.toJSON()

      return res.render('order', {
        cart: result,
        user
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
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
  },
  getPayment: (req, res, next) => {
    return Order.findByPk(req.params.id, {
      include: [
        User,
        { model: GroupTour, as: 'orderedGroupTours' }
      ]
    })
      .then(order => {
        order = order.toJSON()

        const tradeInfo = getTradeInfo(
          order.confirmPrice,
          order.id,
          order.User.email
        )

        return Promise.all([
          tradeInfo,
          order.update({
            ...req.body,
            sn: tradeInfo.MerchantOrderNo
          })
        ])
      })
      .then(([order, tradeInfo]) => res.render('payment', {
        order,
        tradeInfo
      }))
      .catch(err => next(err))
  }
}

module.exports = orderController
