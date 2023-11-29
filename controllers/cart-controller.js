const { Cart, GroupTour, CartItem } = require('../models')

const cartController = {
  getCart: async (req, res, next) => {
    try {
      const user = req.user

      // 沒有登入(訪客)
      if (!user) {
        // 請先登入才能進購物車
        req.flash('warning_msg', 'Please login first!')
        return res.redirect('/users/login')
      }

      // 有登入(使用者)
      // 顯示使用者購物車
      let cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: [
          { model: GroupTour, as: 'cartedGroupTours' }
        ]
      })

      // 沒有購物車
      if (!cart) return res.render('cart')

      cart = cart.toJSON()

      const result = {
        ...cart,
        // 計算購物車的總金額
        totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
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
      if (quantity <= 0) throw new Error("CartItem's quantity must be greater than 0!")

      const user = req.user
      let cart = {}

      // 使用者
      if (user) {
        const [userCart] = await Cart.findOrCreate({
          where: { userId: req.user.id || 0 }
        })

        cart = userCart
        // 訪客
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

      // 是否創建購物車項目
      if (isCreated) {
        // 不同購物車項目，則購物車顯示數量 + 1
        req.session.cartAmount = cart.amount ? cart.amount + 1 : 1

        // 更新購物車顯示數量 + 1
        await cart.update({
          amount: cart.amount ? cart.amount + 1 : 1
        })
      } else {
        // 更新購物車項目數量
        await cartItem.update({
          quantity: cartItem.quantity + quantity
        })
      }
      console.log(req.session)

      req.flash('success_messages', 'Group tour has successfully added to the shopping cart!')
      return res.redirect('back')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  addCartItem: async (req, res, next) => {
    try {
      const cartItem = await CartItem.findByPk(req.params.id, {
        include: GroupTour
      })
      console.log(cartItem)

      if (!cartItem) throw new Error("CartItem didn't exist!")

      // 購物車項目數量 > 庫存
      if (cartItem.quantity >= cartItem.GroupTour.quantity) throw new Error("CartItem's quantity can't exceed product's inventory!")

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
      if (cartItem.quantity > 1) {
        await cartItem.update({
          quantity: cartItem.quantity - 1
        })
      } else {
        // 購物車顯示數量為 0
        req.session.cartAmount = 0

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

      if (!cartItem) throw new Error("CartItem didn't exist!")

      // 購物車顯示數量為 0
      req.session.cartAmount = 0

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
