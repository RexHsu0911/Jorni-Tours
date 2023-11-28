const { Cart, GroupTour, CartItem } = require('../models')

const cartController = {
  getCart: (req, res, next) => {
    // 查看 Cart 請先登入/註冊(取得 req.user)
    if (!req.user) {
      req.flash('warning_msg', 'Please login first!')
      return res.redirect('/users/login')
      // 若 req.session.cartId 存在，取得訪客的 Cart 資料，合併到使用者的 Cart 中
      // } else if (req.session.cartId) {
      //   console.log(req.session)

      //   return Promise.all([
      //     Cart.findOne({ where: { id: req.session.cartId } }),
      //     Cart.findOrCreate({
      //       where: { id: req.user.id },
      //       defaults: { id: req.user.id },
      //       include: [
      //         { model: GroupTour, as: 'cartedGroupTours' }
      //       ]
      //     })
      //   ])
      //     .then(([visitorCart, userCart, isUserCartCreated]) => {
      //       // 取得訪客 CartItem 中的所有項目
      //       return CartItem.findAll({
      //         where: { cartId: visitorCart.id }
      //       })
      //         .then(visitorItems => {
      //           // 處理訪客合併到使用者 CartItem 的所有資料
      //           const AddToUserCart = visitorItems.map(visitorItem => {
      //             // 若使用者找不到相同的 CartItem，則創建一個
      //             return CartItem.findOrCreate({
      //               where: {
      //                 cartId: userCart.id,
      //                 groupTourId: visitorItem.groupTourId
      //               },
      //               defaults: {
      //                 cartId: userCart.id,
      //                 groupTourId: visitorItem.groupTourId,
      //                 quantity: visitorItem.quantity
      //               }
      //             })
      //               .then(([userItem, isUserItemCreated]) => {
      //                 // 若創建新的 CartItem，則 Cart 數量 + 1，反之，則更新CartItem 的數量
      //                 if (isUserItemCreated) {
      //                   return userCart.update({
      //                     amount: userCart.amount + visitorCart.amount
      //                   })
      //                     .then(() => userCart)
      //                 } else {
      //                   return userItem.update({
      //                     quantity: userItem.quantity + visitorItem.quantity
      //                   })
      //                     .then(() => userItem)
      //                 }
      //               })
      //           })
      //           return Promise.all(AddToUserCart)
      //         })
      //         .then(() => {
      //           // 更新儲存在 session 資料
      //           req.session.cartId = null
      //           req.session.cartAmount = userCart.amount
      //           // 刪除訪客的 Cart
      //           return visitorCart.destroy()
      //         })
      //         .catch(err => next(err))
      //     })
      //     .then(cart => {
      //       cart = cart.toJSON()

      //       const result = {
      //         ...cart,
      //         // 計算 Cart 的總金額
      //         totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
      //       }
      //       // console.log(result)

    //       return res.render('cart', { cart: result })
    //     })
    //     .catch(err => next(err))
      // 若只有 req.user.id 存在，取得使用者的 Cart
    } else {
      return Cart.findOrCreate({
        where: { id: req.user.id },
        defaults: { id: req.user.id },
        include: [
          CartItem,
          { model: GroupTour, as: 'cartedGroupTours' }
        ]
      })
        .then(([cart, isCartCreated]) => {
          cart = cart.toJSON()

          const result = {
            ...cart,
            totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
          }
          console.log(result.cartedGroupTours)

          req.session.cartAmount = cart.amount
          console.log(req.session)

          return res.render('cart', { cart: result })
        })
        .catch(err => next(err))
    }
  },
  postCart: (req, res, next) => {
    const groupTourId = Number(req.body.groupTourId)
    const quantity = Number(req.body.quantity)

    if (!groupTourId) throw new Error("Group tour didn't exist!")
    const userCartId = req.user ? req.user.id : null
    const visitorCartId = req.session.cartId ? req.session.cartId : 0

    // 查找 Cart ，先找使用者為 req.user.id ，再找訪客為 req.session.cartId，若都找不到，則預設為 0 (創建新的 Cart.id)
    return Cart.findOrCreate({
      where: { id: userCartId || visitorCartId },
      defaults: { id: userCartId || 0 }
    })
      .then(([cart, isCartCreated]) => {
        // findOrCreate 回傳第二個值 isCreated 為 boolean 值，表示是否創建新的實例

        // 查找與 Cart 關聯的 CartItem
        return CartItem.findOrCreate({
          where: {
            cartId: cart.id,
            groupTourId
          },
          defaults: { // 如果未找到，則創建指定默認值
            cartId: cart.id,
            groupTourId,
            quantity
          }
        })
          .then(([cartItem, isCartItemCreated]) => {
            console.log(cartItem)
            // 更新儲存在 session 資料
            req.session.cartId = req.user ? null : cart.id
            req.session.cartAmount = cart.amount + quantity
            console.log(req.session)
            // 若創建新的 CartItem，則 Cart 數量 + 1，反之，則更新CartItem 的數量
            if (isCartItemCreated) {
              return cart.update({
                amount: cart.amount + quantity
              })
            } else {
              return cartItem.update({
                quantity: cartItem.quantity + quantity
              })
            }
          })
          .then(() => {
            req.flash('success_messages', 'Group tour has successfully added to the shopping cart!')
            return res.redirect('back')
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  },
  addCartItem: (req, res, next) => {
    return CartItem.findOne({
      include: GroupTour,
      where: {
        cartId: req.user.id,
        groupTourId: req.params.groupTourId
      }
    })
      .then(cartItem => {
        if (!cartItem) throw new Error("CartItem didn't exist!")
        if (cartItem.quantity >= cartItem.GroupTour.quantity) throw new Error("CartItem's quantity can't exceed product's inventory!")
        console.log(cartItem)

        return cartItem.update({
          quantity: cartItem.quantity + 1
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  subCartItem: (req, res, next) => {
    return CartItem.findOne({
      where: {
        cartId: req.user.id,
        groupTourId: req.params.groupTourId
      }
    })
      .then(cartItem => {
        if (!cartItem) throw new Error("CartItem didn't exist!")
        if (cartItem.quantity > 1) {
          return cartItem.update({
            quantity: cartItem.quantity - 1
          })
        } else {
          return cartItem.destroy()
        }
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  deleteCartItem: (req, res, next) => {
    return CartItem.findOne({
      where: {
        cartId: req.user.id,
        groupTourId: req.params.groupTourId
      }
    })
      .then(cartItem => {
        if (!cartItem) throw new Error("CartItem didn't exist!")

        return cartItem.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = cartController
