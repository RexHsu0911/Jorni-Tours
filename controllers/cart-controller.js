const { Cart, GroupTour, CartItem } = require('../models')

const cartController = {
  getCart: (req, res, next) => {
    const { cartId } = req.session
    // if (!cartId) throw new Error("Cart didn't exist!")

    return Cart.findByPk(cartId, {
      include: [
        CartItem,
        { model: GroupTour, as: 'cartedGroupTours' }
      ]
    })
      .then(cart => {
        // if (!cart) throw new Error("You haven't added this group tour to the cart!")

        cart = cart ? cart.toJSON() : { cartedGroupTours: [] }
        const total = cart.cartedGroupTours.length > 0
          ? cart.cartedGroupTours.map(cgt => (cgt.price * cgt.CartItem.quantity))
            .reduce((a, b) => a + b)
          : 0

        console.log(cart)
        return res.render('cart', { cart, total })
      })
      .catch(err => next(err))
  },
  // async/await 處理複雜的非同步邏輯更合適，.then 可能會導致巢狀的結構，降低可讀性
  postCart: async (req, res, next) => {
    try {
      const { groupTourId, quantity } = req.body
      if (!groupTourId) throw new Error("Group tour didn't exist!")

      // findOrCreate 回傳第二個值 isCreated 為 boolean 值，表示是否創建新的實例
      const [cart, isCreated] = await Cart.findOrCreate({
        where: { id: req.session.cartId || 0 } // 找不到，則預設為 0 (創建新的 id)
      })
      console.log(isCreated)

      const [cartItem] = await CartItem.findOrCreate({
        where: {
          cartId: cart.id,
          groupTourId
        },
        defaults: { // 如果未找到，則創建指定默認值
          cartId: cart.id,
          groupTourId
        }
      })

      await cartItem.update({
        quantity: Number(cartItem.quantity || 0) + Number(quantity)
      })

      req.session.cartId = cart.id
      await req.session.save()
      console.log(req.session.cartId)

      req.flash('success_messages', 'Group tour has successfully added to the shopping cart!')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  addCartItem: (req, res, next) => {
    return CartItem.findByPk(req.params.id, {
      include: GroupTour
    })
      .then(cartItem => {
        if (!cartItem) throw new Error("CartItem didn't exist!")
        if (cartItem.quantity >= cartItem.GroupTour.quantity) throw new Error("CartItem's quantity can't exceed product's inventory!")

        return cartItem.update({
          quantity: cartItem.quantity + 1
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = cartController
