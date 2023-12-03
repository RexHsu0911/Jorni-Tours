const { Cart, GroupTour, CartItem } = require('../models')

const cartController = {
  getCart: async (req, res, next) => {
    try {
      // 顯示使用者購物車
      let cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: [
          { model: GroupTour, as: 'cartedGroupTours' }
        ]
      })

      // 購物車為空的
      if (!cart) return res.render('cart')

      cart = cart.toJSON()

      // 顯示購物車數量
      req.session.cartAmount = cart.amount
      // console.log(req.session)

      const result = {
        ...cart,
        // 計算購物車的總金額
        totalPrice: cart.cartedGroupTours.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
      }
      console.log('使用者購物車:', cart.cartedGroupTours)

      return res.render('cart', { cart: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postCart: async (req, res, next) => {
    try {
      const groupTourId = Number(req.body.groupTourId)
      const quantity = Number(req.body.quantity)

      // 選擇數量 <= 0
      if (quantity <= 0) {
        req.flash('warning_messages', "Group tour's quantity must be greater than 「0」!")
        return res.redirect('back')
      }

      const groupTour = await GroupTour.findByPk(groupTourId)

      // 選擇數量 > 庫存
      if (quantity > groupTour.quantity) {
        req.flash('warning_messages', `The quantity remaining for the group tour named「${groupTour.name}」is「${groupTour.quantity}」!`)
        return res.redirect('back')
      }

      const user = req.user
      let cart = {}

      // 使用者購物車
      if (user) {
        const [userCart] = await Cart.findOrCreate({
          where: { userId: req.user.id || 0 }
        })

        cart = userCart
        // 訪客購物車
      } else {
        const [visitorCart] = await Cart.findOrCreate({
          where: { id: req.session.cartId || 0 },
          defaults: { userId: 0 }
        })

        // 儲存訪客的購物車 id 到 session
        req.session.cartId = visitorCart.id

        cart = visitorCart
      }

      // findOrCreate 回傳第二個值 isCreated 為 boolean 值，表示是否創建新的實例
      const [cartItem, isCreated] = await CartItem.findOrCreate({
        where: {
          cartId: cart.id,
          groupTourId
        },
        defaults: { quantity }
      })

      // 創建購物車項目
      if (isCreated) {
        // 更新顯示購物車數量 + 1
        await cart.update({
          amount: cart.amount ? cart.amount + 1 : 1
        })
      } else {
        // 更新購物車項目數量
        await cartItem.update({
          quantity
        })
      }

      // 購物車項目數量 > 庫存
      if (cartItem.quantity + 1 > groupTour.quantity) {
        req.flash('warning_messages', `The quantity remaining for the group tour named「${groupTour.name}」is「${groupTour.quantity}」!`)
        return res.redirect('back')
      }

      // 顯示購物車數量
      req.session.cartAmount = cart.amount
      // console.log(req.session)

      req.flash('success_messages', 'Group tour has successfully added to the shopping cart!')
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  addCartItem: async (req, res, next) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id)

      const groupTour = await GroupTour.findByPk(cartItem.groupTourId)

      if (!cartItem) throw new Error("CartItem didn't exist!")
      if (!groupTour) throw new Error("Group tour didn't exist!")

      // 購物車項目數量 > 庫存
      if (cartItem.quantity + 1 > groupTour.quantity) {
        req.flash('warning_messages', `The quantity remaining for the group tour named「${groupTour.name}」is「${groupTour.quantity}」!`)
        return res.redirect('back')
      }

      // 更新購物車項目數量 + 1
      await cartItem.update({
        quantity: cartItem.quantity + 1
      })

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  subCartItem: async (req, res, next) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id)

      if (!cartItem) throw new Error("CartItem didn't exist!")

      // 更新購物車項目數量 - 1
      if (cartItem.quantity - 1 > 0) {
        await cartItem.update({
          quantity: cartItem.quantity - 1
        })
      } else {
        const cart = await Cart.findOne({
          where: { userId: req.user.id }
        })

        if (!cart) throw new Error("Cart didn't exist!")

        // 更新顯示購物車數量 - 1
        await cart.update({ amount: cart.amount ? cart.amount - 1 : null }, {
          where: { userId: req.user.id }
        })

        // 刪除購物車項目
        await cartItem.destroy()
      }

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  deleteCartItem: async (req, res, next) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id)

      const cart = await Cart.findOne({
        where: { userId: req.user.id }
      })

      if (!cartItem) throw new Error("CartItem didn't exist!")
      if (!cart) throw new Error("Cart didn't exist!")

      // 更新顯示購物車數量 - 1
      await cart.update({ amount: cart.amount ? cart.amount - 1 : null }, {
        where: { userId: req.user.id }
      })

      // 刪除購物車項目
      await cartItem.destroy()

      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = cartController
