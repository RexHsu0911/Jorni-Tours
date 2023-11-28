const { Cart, GroupTour, CartItem } = require('../models')

const cartController = {
  // getCart: (req, res, next) => {
  //   // 查看 Cart 請先登入/註冊(取得 req.user)
  //   if (!req.user) {
  //     req.flash('warning_msg', 'Please login first!')
  //     return res.redirect('/users/login')
  //     // 若 req.session.cartId 存在，取得訪客的 Cart 資料，合併到使用者的 Cart 中
  //     // } else if (req.session.cartId) {
  //     //   console.log(req.session)

  //     //   return Promise.all([
  //     //     Cart.findOne({ where: { id: req.session.cartId } }),
  //     //     Cart.findOrCreate({
  //     //       where: { id: req.user.id },
  //     //       defaults: { id: req.user.id },
  //     //       include: [
  //     //         { model: GroupTour, as: 'cartedGroupTours' }
  //     //       ]
  //     //     })
  //     //   ])
  //     //     .then(([visitorCart, cart, isUserCartCreated]) => {
  //     //       // 取得訪客 CartItem 中的所有項目
  //     //       return CartItem.findAll({
  //     //         where: { cartId: visitorCart.id }
  //     //       })
  //     //         .then(visitorItems => {
  //     //           // 處理訪客合併到使用者 CartItem 的所有資料
  //     //           const AddToUserCart = visitorItems.map(visitorItem => {
  //     //             // 若使用者找不到相同的 CartItem，則創建一個
  //     //             return CartItem.findOrCreate({
  //     //               where: {
  //     //                 cartId: cart.id,
  //     //                 groupTourId: visitorItem.groupTourId
  //     //               },
  //     //               defaults: {
  //     //                 cartId: cart.id,
  //     //                 groupTourId: visitorItem.groupTourId,
  //     //                 quantity: visitorItem.quantity
  //     //               }
  //     //             })
  //     //               .then(([userItem, isUserItemCreated]) => {
  //     //                 // 若創建新的 CartItem，則 Cart 數量 + 1，反之，則更新CartItem 的數量
  //     //                 if (isUserItemCreated) {
  //     //                   return cart.update({
  //     //                     amount: cart.amount + visitorCart.amount
  //     //                   })
  //     //                 } else {
  //     //                   return userItem.update({
  //     //                     quantity: userItem.quantity + visitorItem.quantity
  //     //                   })
  //     //                 }
  //     //               })
  //     //           })
  //     //           return Promise.all(AddToUserCart)
  //     //         })
  //     //         .then(() => {
  //     //           // 更新儲存在 session 資料
  //     //           req.session.cartId = null
  //     //           req.session.cartAmount = cart.amount
  //     //           // 刪除訪客的 Cart
  //     //           return visitorCart.destroy()
  //     //         })
  //     //     })
  //     //     .then(cart => {
  //     //       cart = cart.toJSON()

  //     //       const result = {
  //     //         ...cart,
  //     //         // 計算 Cart 的總金額
  //     //         totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
  //     //       }
  //     //       // console.log(result)

  //   //       return res.render('cart', { cart: result })
  //   //     })
  //   //     .catch(err => next(err))
  //   } else {
  //     return Cart.findByPk(req.user.id, {
  //       include: [
  //         { model: GroupTour, as: 'cartedGroupTours' }
  //       ]
  //     })
  //       .then(cart => {
  //         cart = cart ? cart.toJSON() : { cartedGroupTours: [] }

  //         const result = {
  //           ...cart,
  //           totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
  //         }
  //         console.log(result.cartedGroupTours)

  //         req.session.cartAmount = cart.amount
  //         console.log(req.session)

  //         return res.render('cart', { cart: result })
  //       })
  //       .catch(err => next(err))
  //   }
  // },

  // postCart: (req, res, next) => {
  //   const groupTourId = Number(req.body.groupTourId)
  //   const quantity = Number(req.body.quantity)
  //   if (!groupTourId) throw new Error("Group tour didn't exist!")
  //   const userCartId = req.user ? req.user.id : null
  //   const visitorCartId = req.session.cartId ? req.session.cartId : 0

  //   return Cart.findOrCreate({
  //     where: { id: userCartId || visitorCartId }
  //   })
  //     .then(([cart, isCartCreated]) => {
  //       // findOrCreate 回傳第二個值 isCreated 為 boolean 值，表示是否創建新的實例

  //       // 查找與 Cart 關聯的 CartItem
  //       return CartItem.findOrCreate({
  //         where: {
  //           cartId: cart.id,
  //           groupTourId
  //         },
  //         defaults: { // 如果未找到，則創建指定默認值
  //           cartId: cart.id,
  //           groupTourId,
  //           quantity
  //         }
  //       })
  //         .then(([cartItem, isCartItemCreated]) => {
  //           console.log(cartItem)
  //           // 更新儲存在 session 資料
  //           req.session.cartId = cart.id

  //           // 若創建新的 CartItem，則 Cart 數量 + 1，反之，則更新CartItem 的數量
  //           if (isCartItemCreated) {
  //             // 不同 CartItem，則 cartAmount + 1
  //             req.session.cartAmount = (cart.amount || 0) + 1
  //             console.log(req.session)

  //             return cart.update({
  //               amount: (cart.amount || 0) + 1
  //             })
  //           } else {
  //             return cartItem.update({
  //               quantity: cartItem.quantity + quantity
  //             })
  //           }
  //         })
  //         .then(() => {
  //           req.flash('success_messages', 'Group tour has successfully added to the shopping cart!')
  //           return res.redirect('back')
  //         })
  //         .catch(err => next(err))
  //     })
  //     .catch(err => next(err))
  // },
  getCart: async (req, res, next) => {
    try {
      const user = req.user

      // 是否為使用者
      if (!user) {
        // 請先登入才能進購物車
        req.flash('warning_msg', 'Please login first!')
        return res.redirect('/users/login')
      } else {
        // 查找使用者的購物車
        let cart = await Cart.findOne({
          where: { userId: req.user.id },
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ]
        })

        // 是否有購物車
        if (!cart) {
          return res.render('cart')
        } else {
          cart = cart ? cart.toJSON() : { cartedGroupTours: [] }

          const result = {
            ...cart,
            // 計算購物車的總金額
            totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
          }
          console.log(result.cartedGroupTours)

          return res.render('cart', { cart: result })
        }
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  postCart: async (req, res, next) => {
    try {
      const groupTourId = Number(req.body.groupTourId)
      const quantity = Number(req.body.quantity)
      const user = req.user
      let cart = {}
      if (quantity <= 0) throw new Error("CartItem's quantity must be greater than 0!")

      // 是否為使用者
      if (user) {
        const [userCart] = await Cart.findOrCreate({
          where: { userId: req.user.id || 0 }
        })

        cart = userCart
      } else {
        const [visitorCart] = await Cart.findOrCreate({
          where: { id: req.session.cartId || 0 },
          defaults: { userId: 0 }
        })

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

      // 儲存購物車的 id 到 session
      req.session.cartId = cart.id
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
