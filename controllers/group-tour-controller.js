const { GroupTour, Category, Comment, User, Cart, CartItem } = require('../models')
// 分頁
const { getOffset, getPagination } = require('../helpers/pagination-helper')
// （Operators）物件是用來定義不同的 SQL 操作符的工具
const { Op } = require('sequelize')

const groupTourController = {
  getGroupTours: async (req, res, next) => {
    try {
      // 關鍵字
      const keyword = req.query.keyword?.trim() || ''
      // 分類
      // 從網址上查詢參數 categoryId 是字串，先轉成 Number 再操作
      const categoryId = Number(req.query.categoryId) || ''
      // 分頁參數
      const DEFAULT_LIMIT = 9
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const offset = getOffset(page, limit)
      // 查詢條件
      const whereQuery = {}

      if (categoryId) {
        // 搜尋分類
        whereQuery.categoryId = categoryId
      }

      if (keyword) {
      // 搜尋關鍵字
      // Op.like 運算符用於執行模糊查詢，% 不限定在開頭或結尾
        whereQuery.name = { [Op.like]: '%' + keyword + '%' }
      }

      const [groupTours, categories] = await Promise.all([
        // 顯示商品
        GroupTour.findAndCountAll({
          raw: true,
          nest: true,
          include: Category,
          where: whereQuery,
          limit, // 每頁限制
          offset // 每次偏移
        }),
        // 顯示分類列
        Category.findAll({ raw: true })
      ])

      if (!groupTours) throw new Error("Group tours didn't exist!")
      if (!categories) throw new Error("Categories didn't exist!")

      const user = req.user
      let cartResult = {}

      // 購物車
      // 沒有登入(訪客)
      if (!user) {
        // 訪客有加入商品至購物車
        if (req.session.cartId) {
          let cart = await Cart.findByPk(req.session.cartId, {
            include: [
              { model: GroupTour, as: 'cartedGroupTours' }
            ]
          })

          if (!cart) throw new Error("Cart didn't exist!")

          cart = cart.toJSON()
          // console.log('訪客購物車:', cart.cartedGroupTours)

          cartResult = cart
        }
        // 有登入(使用者)
      } else {
        // 顯示使用者購物車
        let cart = await Cart.findOne({
          where: { userId: req.user.id },
          include: [
            { model: GroupTour, as: 'cartedGroupTours' }
          ]
        })

        // 訪客有加入商品至購物車
        if (req.session.cartId) {
          // 使用者沒有購物車，則更新為使用者的購物車(userId)
          if (!cart) {
            // 將 id 為 req.session.cartId 更新 userId
            await Cart.update({ userId: req.user.id }, {
              where: { id: req.session.cartId }
            })
            // 使用者有購物車，則更新為使用者的購物車項目(cartId)
          } else {
            // 將 cartId 由 req.session.cartId 更新為 req.user.id
            await CartItem.update({ cartId: cart.id }, {
              where: { cartId: req.session.cartId }
            })

            // 顯示使用者所有的購物車項目
            const cartItems = await CartItem.findAll({
              raw: true,
              nest: true,
              where: { cartId: cart.id }
            })

            if (!cartItems) throw new Error("CartItems didn't exist!")

            const groupTourMap = {}

            // 遍歷購物車項目
            for (const item of cartItems) {
              // 不存在 groupTourMap 物件中，則加入
              if (!groupTourMap[item.groupTourId]) {
                // 例 cartItems 中 {id: 1, groupTourId: 101}
                // groupTourMap 中為 { 101: 1 }
                groupTourMap[item.groupTourId] = item.id
                // 存在 groupTourMap 物件中
              } else {
                // groupTourMap[item.groupTourId] = 1, item.id = 3
                // 例 cartItems 中 { id: 3, groupTourId: 101 }
                const cartItem = await CartItem.findByPk(groupTourMap[item.groupTourId])

                if (!cartItem) throw new Error("CartItem didn't exist!")

                // 重複購物車項目，則更新數量完成後，刪除訪客的購物車項目
                await cartItem.update({ quantity: cartItem.quantity + item.quantity })

                await CartItem.destroy({ where: { id: item.id } })
              }
            }
            // console.log('遍歷購物車項目:', cartItems)

            // 更新顯示購物車數量
            await cart.update({
              amount: Object.keys(groupTourMap).length
            })

            // 購物車項目完成合併後，則刪除訪客的購物車
            await Cart.destroy({ where: { id: req.session.cartId } })
          }

          // 清除 req.session.cartId
          req.session.cartId = null
        }

        cart = cart ? cart.toJSON() : { cartedGroupTours: [] }

        // 顯示購物車數量
        req.session.cartAmount = cart.amount
        // console.log(req.session)

        cartResult = {
          ...cart,
          // 計算購物車的總金額
          totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
        }
        // console.log('訪客購物車合併到使用者購物車:', cart.cartedGroupTours)
      }

      // console.log(req.session)

      // 取出每個收藏的 id
      const favoritedGroupToursId = req.user ? req.user.FavoritedGroupTours.map(fgt => fgt.id) : []
      // console.log(favoritedGroupToursId)

      // findAndCountAll 回傳 rows 資料集合
      const groupToursResult = groupTours.rows.map(gt => ({
        // ... 展開運算子
        ...gt,
        // substring 截取字串
        description: gt.description?.substring(0, 50),
        // includes 比對是否收藏
        isFavorited: favoritedGroupToursId.includes(gt.id)
      }))
      // console.log('所有商品資料', groupToursResult)

      res.render('group-tours', {
        groupTours: groupToursResult,
        categories,
        categoryId,
        keyword,
        searchCount: groupTours.count,
        // findAndCountAll 回傳 count 資料量
        pagination: getPagination(page, limit, groupTours.count),
        cart: cartResult
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getGroupTour: async (req, res, next) => {
    try {
      const groupTour = await GroupTour.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: User }, // 預先加載 Comment 和 User model
          { model: User, as: 'FavoritedUsers' }
        ]
      })

      if (!groupTour) throw new Error("Group tour didn't exist!")

      const user = req.user
      let cart = null
      let cartItem = {}

      // 存在使用者購物車
      if (user) {
        const userCart = await Cart.findOne({
          where: { userId: req.user.id }
        })

        cart = userCart || null
      }

      // 存在訪客購物車
      if (req.session.cartId) {
        const visitorCart = await Cart.findOne({
          where: { id: req.session.cartId }
        })

        cart = visitorCart || null
      }

      // 存在購物車
      if (cart) {
        const cartItemExist = await CartItem.findOne({
          where: {
            cartId: cart.id,
            groupTourId: req.params.id
          }
        })

        // 存在購物車項目
        if (cartItemExist) {
          // 購物車項目數量 > 庫存
          if (cartItem.quantity > groupTour.quantity) {
            req.flash('warning_messages', `The quantity remaining for the group tour named「${groupTour.name}」is「${groupTour.quantity}」!`)
            return res.redirect('back')
          }
        }

        cartItem = cartItemExist ? cartItemExist.toJSON() : null
      }

      const result = {
        // 使用 toJSON() 把關聯資料轉成 JSON(不破壞一對多關係，{{#each}} 陣列才取得到資料)
        ...groupTour.toJSON(),
        // some 找到一個符合條件的項目，就會立刻回傳 true
        isFavorited: req.user ? groupTour.FavoritedUsers.some(fu => fu.id === req.user.id) : false,
        cartItem
      }
      // console.log(cart.toJSON())
      // console.log('商品資料', result)

      return res.render('group-tour', { groupTour: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getFeeds: async (req, res, next) => {
    try {
      const [groupTours, comments] = await Promise.all([
        GroupTour.findAll({
          raw: true,
          nest: true,
          limit: 5,
          include: [Category, Comment],
          order: [['createdAt', 'DESC']] // 排序條件
        }),
        Comment.findAll({
          raw: true,
          nest: true,
          limit: 5,
          include: [User, GroupTour],
          order: [['createdAt', 'DESC']]
        })
      ])

      if (!groupTours) throw new Error("Group tours didn't exist!")
      if (!comments) throw new Error("Comments didn't exist!")
      // console.log(groupTours)
      // console.log(comments)

      return res.render('feeds', { groupTours, comments })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getTopGroupTours: async (req, res, next) => {
    try {
      const groupTours = await GroupTour.findAll({
        include: [{ model: User, as: 'FavoritedUsers' }]
      })

      if (!groupTours) throw new Error("Group tours didn't exist!")

      const result = groupTours.map(gt => ({
        ...gt.toJSON(),
        description: gt.description?.substring(0, 50),
        favoritedCount: gt.FavoritedUsers.length,
        isFavorited: req.user?.FavoritedGroupTours.some(fgt => fgt.id === gt.id)
      }))
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 5)

      return res.render('top-group-tours', { groupTours: result })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = groupTourController
