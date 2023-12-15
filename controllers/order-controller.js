const { Cart, CartItem, GroupTour, User, Order, OrderItem, Payment, Comment } = require('../models')

const { getTradeInfo, createAesDecrypt } = require('../public/javascripts/payment')

const orderController = {
  getOrderCreate: async (req, res, next) => {
    try {
      const userId = req.user.id

      // 購物車頁面購買(有 req.session.cartId)
      let [user, cart] = await Promise.all([
        User.findByPk(userId),
        Cart.findOne({
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ],
          where: req.session.cartId ? { id: req.session.cartId } : { userId }
        })
      ])

      if (req.session.cartId) {
        req.session.cartId = null
      }
      console.log('session:', req.session.cartId)

      // 購物車不存在或為空的
      if (!cart || !cart.amount) {
        req.flash('warning_messages', 'Your shopping cart is empty. Please add products to your cart before placing an order!')
        return res.redirect('back')
      }

      cart = cart.toJSON()
      user = user.toJSON()

      const result = {
        ...cart,
        totalPrice: cart.cartedGroupTours.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
      }
      console.log('使用者/暫時性購物車:', cart.cartedGroupTours)

      return res.render('create-order', { cart: result, user })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postOrderCreate: async (req, res, next) => {
    try {
      // 直接購買，query 取得商品參數
      const groupTourId = Number(req.body.groupTourId) || null
      const quantity = Number(req.body.quantity) > 0 ? Number(req.body.quantity) : null

      if (groupTourId && !quantity) {
        req.flash('warning_messages', "Group tour's quantity must be greater than 「0」!")
        return res.redirect('back')
      }

      const groupTour = await GroupTour.findByPk(groupTourId)

      // 購物車商品數量 > 庫存
      if (quantity > groupTour.quantity) {
        req.flash('warning_messages', `Sorry, ${groupTour.name} only has ${groupTour.quantity} left, please choose the quantity of it again!`)
        return res.redirect('back')
      }

      // 商品頁面直接購買
      if (groupTourId && quantity) {
        // 創建臨時性購物車
        const cart = await Cart.create({ amount: 1 })

        await CartItem.create({
          cartId: cart.id,
          groupTourId,
          quantity
        })

        // 儲存臨時性購物車 id 到 session
        req.session.cartId = cart.id

        return res.redirect('/orders/create')
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postOrder: async (req, res, next) => {
    try {
      const { firstName, lastName, country, phone, cartId, amount, totalPrice } = req.body
      const userId = req.user.id

      const [cart, userCart] = await Promise.all([
        Cart.findByPk(cartId, {
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ]
        }),
        Cart.findOne({
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ],
          where: { userId }
        })
      ])

      console.log('新增訂單:', cart.cartedGroupTours)

      // 購物車不存在或為空的
      if (!cart || !cart.amount) throw new Error("You don't have any item in your cart!")

      // 購物車商品數量 > 庫存
      for (const GroupTour of cart.cartedGroupTours) {
        if (GroupTour.CartItem.quantity > GroupTour.quantity) {
          req.flash('warning_messages', `Sorry, ${GroupTour.name} only has ${GroupTour.quantity} left, please choose the quantity of it again!`)
          return res.redirect('back')
        }
      }

      // 創建訂單
      const order = await Order.create({
        firstName,
        lastName,
        country,
        phone,
        amount,
        totalPrice,
        orderStatus: '1', // (1:已成立訂單, -1:已取消訂單)
        paymentStatus: '0', // (0:未付款, 1:已付款, -1:付款失敗)
        userId: req.user.id
      })

      await Promise.all(cart.cartedGroupTours.map(async cgt => {
        // 創建訂單商品
        await OrderItem.create({
          orderId: order.id,
          groupTourId: cgt.id,
          price: cgt.price,
          quantity: cgt.CartItem.quantity
        })

        const groupTour = await GroupTour.findByPk(cgt.id)

        // 更新商品庫存
        await groupTour.update({
          quantity: groupTour.quantity - cgt.CartItem.quantity
        })

        // 檢查使用者購物車商品
        userCart.cartedGroupTours.forEach(async ucgt => {
          // 存在重複的購物車商品
          if (cgt.id === ucgt.id) {
            // 使用者購物車商品
            const userCartItem = await CartItem.findOne({ where: { cartId: userCart.id, groupTourId: ucgt.id } })

            // 商品於訂購數量 >= 使用者購物車數量
            if (cgt.CartItem.quantity >= ucgt.CartItem.quantity) {
              // 刪除 CartItem
              await userCartItem.destroy()

              // 更新顯示購物車數量 - 1
              await userCart.update({ amount: userCart.amount > 1 ? userCart.amount - 1 : null })
            } else {
              // 更新 CartItem 的數量
              userCartItem.update({ quantity: ucgt.quantity - cgt.quantity })
            }
          }
        })
      }))

      req.session.cartAmount = userCart.amount

      // 刪除使用者/暫時性購物車
      await Cart.destroy({ where: { id: cartId } })

      await CartItem.destroy({ where: { cartId } })

      return res.redirect(`/orders/${order.id}/payment`)
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getPayment: async (req, res, next) => {
    try {
      const id = req.params.id

      let order = await Order.findByPk(id, {
        include: [
          { model: GroupTour, as: 'OrderedGroupTours' }
        ]
      })

      if (!order) throw new Error("Order didn't exist!")

      // 付款失敗訂單
      if (order.paymentStatus === '-1') {
        // 清除訂單編號
        await order.update({ sn: null })
      }

      // 取得要付款的訂單資料
      const tradeInfo = getTradeInfo(
        order.totalPrice,
        order.id,
        req.user.email,
        order.sn
      )

      // 創建訂單或付款失敗訂單(重新建立)
      if (!order.sn || order.paymentStatus === '-1') {
        // 創建訂單編號
        await order.update({ sn: tradeInfo.MerchantOrderNo })
      }

      order = order.toJSON()
      // console.log('成立訂單:', order)

      return res.render('payment', { order, tradeInfo })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  cancelOrder: async (req, res, next) => {
    try {
      const id = req.params.id

      const order = await Order.findByPk(id, {
        include: [
          { model: GroupTour, as: 'OrderedGroupTours' }
        ]
      })

      // 訂單已付款，則不能取消
      if (order.paymentStatus === '1') {
        req.flash('error_messages', "Order has been paid for and can't be canceled")
        // 訂單已取消
      } else {
        await order.update({
          orderStatus: '-1'
        })

        await order.OrderedGroupTours.map(async gt => {
          const groupTour = await GroupTour.findByPk(gt.id)

          // 更新商品庫存
          await groupTour.update({
            quantity: groupTour.quantity + gt.OrderItem.quantity
          })
        })

        req.flash('success_messages', 'Order has been canceled!')
      }

      return res.redirect('/orders')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  // 信用卡一次付清的測試卡號為 4000–2211–1111–1111，有效年月以及背面末三碼自由輸入
  // 當訂單金額超過 49,999，則啟用 WEBATM 及 ATM轉帳
  newebpayCallback: async (req, res, next) => {
    try {
      const tradeInfo = req.body.TradeInfo
      const data = JSON.parse(createAesDecrypt(tradeInfo))

      const order = await Order.findOne({
        where: { sn: data.Result.MerchantOrderNo }
      })

      await Payment.create({
        sn: data.Result.MerchantOrderNo,
        paymentType: data.Result.PaymentType,
        paymentStatus: data.Status === 'SUCCESS' ? '1' : '-1',
        orderId: order.id
      })

      // 付款成功
      if (data.Status === 'SUCCESS') {
        await order.update({
          paymentStatus: '1'
        })
        console.log('付款成功:', data)

        req.flash('success_messages', 'Payment successful!')
        return res.redirect('/orders')
        // 付款失敗
      } else {
        await order.update({
          paymentStatus: '-1'
        })
        console.log('付款失敗:', data)
        req.flash('warning_messages', `Payment failed! (${data.Message})`)
        return res.redirect(`/orders/${order.id}/payment`)
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getOrders: async (req, res, next) => {
    try {
      const userId = req.user.id

      const [orders, comments] = await Promise.all([
        Order.findAll({
          where: { userId },
          include: [
            { model: GroupTour, as: 'OrderedGroupTours' }
          ],
          raw: true,
          nest: true
        }),
        Comment.findAll({
          where: { userId },
          raw: true
        })
      ])

      // 訂單管理為空的
      if (!orders.length) return res.render('orders', { orders })

      const result = orders.map(o => ({
        ...o,
        OrderedGroupTours: {
          ...o.OrderedGroupTours,
          // 是否已出發
          isSetOff: new Date(o.OrderedGroupTours.departureDate) < new Date(),
          // 是否已評論
          isComment: comments.some(c => (
            c.groupTourId === o.OrderedGroupTours.id && c.orderId === o.id
          ))
        }
      }))
      console.log('訂單管理:', result)

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
          { model: GroupTour, as: 'OrderedGroupTours' },
          Comment,
          Payment
        ]
      })

      if (!order) throw new Error("Order didn't exist!")

      order = order.toJSON()

      const result = {
        ...order,
        OrderedGroupTours: order.OrderedGroupTours.map(ogt =>
          (ogt.id === groupTourId)
            ? {
                ...ogt,
                isOrderItem: true,
                isSetOff: new Date(ogt.departureDate) < new Date(),
                isComment: order.Comments.some(oc => oc.groupTourId === groupTourId)
              }
            : ogt
        ),
        Payments: order.Payments.find(op => op.sn === order.sn)
      }
      // console.log('specificGroupTour', specificGroupTour)
      console.log('訂單:', result)

      return res.render('order', { order: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getOrderComment: async (req, res, next) => {
    try {
      const id = req.params.id
      const groupTourId = Number(req.query.groupTourId)

      let order = await Order.findByPk(id, {
        include: [
          { model: GroupTour, as: 'OrderedGroupTours', where: { id: groupTourId } },
          { model: Comment, include: User, where: { groupTourId } }
        ]
      })

      if (!order) throw new Error("Order didn't exist!")

      order = order.toJSON()

      const result = {
        ...order,
        OrderedGroupTours: order.OrderedGroupTours.map(ogt => ({
          ...ogt,
          isOrderItem: true,
          isSetOff: new Date(ogt.departureDate) < new Date()
        }))
      }
      // console.log('specificGroupTour', specificGroupTour)
      console.log('訂單評論:', result)

      return res.render('order-comment', { order: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = orderController
