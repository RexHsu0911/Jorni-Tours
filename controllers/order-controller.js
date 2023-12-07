const { Cart, CartItem, GroupTour, User, Order, OrderItem, Payment } = require('../models')

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
        const temporaryCart = await Cart.create({
          amount: 1
        })

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

      // 購物車不存在或為空的
      if (!cart || !cart.amount) {
        req.flash('warning_messages', 'Your shopping cart is empty. Please add products to your cart before placing an order!')
        return res.redirect('cart')
      }

      cart = cart.toJSON()

      const result = {
        ...cart,
        totalPrice: cart.cartedGroupTours.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
      }
      console.log('使用者購物車:', cart.cartedGroupTours)

      // 填入使用者資料
      let user = await User.findByPk(userId)

      user = user.toJSON()

      return res.render('create-order', {
        cart: result,
        user
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postOrder: async (req, res, next) => {
    try {
      const { firstName, lastName, country, phone, cartId, amount, totalPrice } = req.body

      let cart = await Cart.findByPk(cartId, {
        include: [
          { model: GroupTour, as: 'cartedGroupTours' }
        ]
      })

      cart = cart.toJSON()
      console.log('新增訂單的購物車', cart.cartedGroupTours)

      // 購物車不存在或為空的
      if (!cart || !cart.amount) throw new Error("You don't have any item in your cart!")

      // 購物車商品數量 > 庫存
      for (const GroupTour of cart.cartedGroupTours) {
        if (GroupTour.CartItem.quantity > GroupTour.quantity) throw new Error(`Sorry, ${GroupTour.name} only has ${GroupTour.quantity} left, please choose the quantity of it again!`)
      }

      // 創建訂單
      const order = await Order.create({
        firstName,
        lastName,
        country,
        phone,
        amount,
        totalPrice,
        orderStatus: 1, // (0:已取消, 1:處理中）
        paymentStatus: 0, // (0:尚未付款, 1:已付款)
        userId: req.user.id
      })

      await cart.cartedGroupTours.map(async gt => {
        // 創建訂單商品
        await OrderItem.create({
          orderId: order.id,
          groupTourId: gt.id,
          price: gt.price,
          quantity: gt.CartItem.quantity
        })

        const groupTour = await GroupTour.findByPk(gt.id)

        // 更新商品庫存
        await groupTour.update({
          quantity: groupTour.quantity - gt.CartItem.quantity
        })
      })

      await Payment.create({
        orderId: order.id
      })

      // 儲存創建的訂單 id 到 session
      req.session.orderId = order.id

      // 訂購完成後，清空購物車
      await Cart.destroy({ where: { id: cartId } })

      await CartItem.destroy({ where: { cartId } })

      return res.redirect('/payment')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getPayment: async (req, res, next) => {
    try {
      let order = await Order.findByPk(req.session.orderId, {
        include: [
          { model: GroupTour, as: 'OrderedGroupTours' }
        ]
      })

      if (!order) throw new Error("Order didn't exist!")

      order = order.toJSON()
      console.log('訂單', order)

      return res.render('payment', { order })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  newebpayCallback: (req, res, next) => {
    return Order.findByPk(req.params.id, {
      include: [
        User,
        { model: GroupTour, as: 'OrderedGroupTours' }
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
  },
  getOrders: async (req, res, next) => {
    try {
      const userId = req.user.id

      const orders = await Order.findAll({
        where: { userId },
        include: [
          { model: GroupTour, as: 'OrderedGroupTours' }
        ],
        raw: true,
        nest: true
      })

      // 訂單管理為空的
      if (!orders.length) return res.render('orders', { orders })

      const result = orders.map(o => ({
        ...o,
        OrderedGroupTours: {
          ...o.OrderedGroupTours,
          // 是否已出發
          isSetOff: new Date(o.OrderedGroupTours.departureDate) < new Date()
        }
      }))

      console.log('訂單管理', result)

      return res.render('orders', { orders: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getOrder: async (req, res, next) => {
    try {
      const id = req.params.id
      const groupTourId = Number(req.query.groupTourId)

      let order = await Order.findByPk(id, {
        include: [
          {
            model: GroupTour,
            as: 'OrderedGroupTours'
          }
        ]
      })

      // 訂單管理為空的
      if (!order) return res.render('order', { order })

      order = order.toJSON()
      console.log('訂單', order.OrderedGroupTours)

      const specificGroupTour = order.OrderedGroupTours.find(ogt => ogt.id === groupTourId)

      const result = {
        ...order,
        specificGroupTour: {
          ...specificGroupTour,
          isSetOff: new Date(specificGroupTour.departureDate) < new Date()
        }
      }

      console.log('specificGroupTour', specificGroupTour)
      console.log('訂單', result)

      return res.render('order', { order: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = orderController
