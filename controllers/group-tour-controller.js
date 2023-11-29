const { GroupTour, Category, Comment, User, Cart, CartItem } = require('../models')
// 分頁
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const groupTourController = {
  getGroupTours: async (req, res, next) => {
    try {
      // 從網址上查詢參數 categoryId 是字串，先轉成 Number 再操作
      // 分類參數
      const categoryId = Number(req.query.categoryId) || ''
      // 分頁參數
      const DEFAULT_LIMIT = 9
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const offset = getOffset(page, limit)

      // 顯示商品
      const groupTours = await GroupTour.findAndCountAll({
        raw: true,
        nest: true,
        include: Category,
        // 選取分類
        where: {
          ...categoryId ? { categoryId } : {} // 檢查 categoryId 是否為空值
        },
        limit, // 每頁限制
        offset // 每次偏移
      })

      // 顯示分類列
      const categories = await Category.findAll({ raw: true })

      if (!groupTours) throw new Error("Group tours didn't exist!")
      if (!categories) throw new Error("Categories didn't exist!")

      const user = req.user
      let cartResult = {}

      // 沒有登入(訪客)
      if (!user) {
        // 訪客有加入商品至購物車
        if (req.session.cartId) {
          let cart = await Cart.findByPk(req.session.cartId, {
            include: [
              { model: GroupTour, as: 'cartedGroupTours' }
            ]
          })
          cart = cart.toJSON()
          console.log('訪客購物車:', cart.cartedGroupTours)

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

                // 重複購物車項目，則更新數量完成後，刪除訪客的購物車項目
                await cartItem.update({ quantity: cartItem.quantity + item.quantity })
                await CartItem.destroy({ where: { id: item.id } })
              }
            }

            console.log('遍歷購物車項目:', cartItems)

            // 購物車項目完成合併後，則刪除訪客的購物車
            await Cart.destroy({ where: { id: req.session.cartId } })
          }

          // 清除 req.session.cartId
          req.session.cartId = null
        }
        console.log(req.session)

        cart = cart ? cart.toJSON() : { cartedGroupTours: [] }

        cartResult = {
          ...cart,
          // 計算購物車的總金額
          totalPrice: cart.cartedGroupTours?.reduce((acc, cgt) => acc + (cgt.price * cgt.CartItem.quantity), 0)
        }
        console.log('訪客購物車合併到使用者購物車:', cart.cartedGroupTours)
      }

      // 取出每個收藏的 id
      const favoritedGroupToursId = req.user ? req.user.FavoritedGroupTours.map(fgt => fgt.id) : []
      // console.log(favoritedGroupToursId)

      // findAndCountAll 回傳 rows 資料集合
      const groupToursResult = groupTours.rows.map(gt => ({
        ...gt, // ... 展開運算子
        description: gt.description?.substring(0, 50), // substring 截取字串
        isFavorited: favoritedGroupToursId.includes(gt.id) //  includes 比對是否收藏
      }))
      // console.log(result)

      res.render('group-tours', {
        groupTours: groupToursResult,
        categories,
        categoryId,
        pagination: getPagination(page, limit, groupTours.count), // findAndCountAll 回傳 count 資料量
        cart: cartResult
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  getGroupTour: (req, res, next) => {
    return GroupTour.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User }, // 預先加載 Comment 和 User model
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(groupTour => {
        // console.log(groupTour.toJSON())
        if (!groupTour) throw new Error("Group tour didn't exist!")

        const isFavorited = req.user ? groupTour.FavoritedUsers.some(fu => fu.id === req.user.id) : false // some 找到一個符合條件的項目，就會立刻回傳 true
        // console.log(isFavorited)

        return res.render('group-tour', {
          groupTour: groupTour.toJSON(), // 使用 toJSON() 把關聯資料轉成 JSON(不破壞一對多關係，{{#each}} 陣列才取得到資料)
          isFavorited
        })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      GroupTour.findAll({
        raw: true,
        nest: true,
        limit: 10,
        include: Category,
        order: [['createdAt', 'DESC']] // 排序條件
      }),
      Comment.findAll({
        raw: true,
        nest: true,
        limit: 10,
        include: [User, GroupTour],
        order: [['createdAt', 'DESC']]
      })
    ])
      .then(([groupTours, comments]) => {
        if (!groupTours) throw new Error("Group tours didn't exist!")
        if (!comments) throw new Error("Comments didn't exist!")
        // console.log(groupTours)
        // console.log(comments)

        return res.render('feeds', { groupTours, comments })
      })
      .catch(err => next(err))
  },
  getTopGroupTours: (req, res, next) => {
    return GroupTour.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(groupTours => {
        if (!groupTours) throw new Error("Group tours didn't exist!")

        const result = groupTours.map(gt => ({
          ...gt.toJSON(),
          description: gt.description?.substring(0, 50),
          favoritedCount: gt.FavoritedUsers.length,
          isFavorited: req.user?.FavoritedGroupTours.some(fgt => fgt.id === gt.id)
        }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)

        return res.render('top-group-tours', { groupTours: result })
      })
      .catch(err => next(err))
  }
}

module.exports = groupTourController
