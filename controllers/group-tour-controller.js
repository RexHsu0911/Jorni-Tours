const { GroupTour, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const groupTourController = {
  getGroupTours: (req, res, next) => {
    // 從網址上查詢參數 categoryId 是字串，先轉成 Number 再操作
    const categoryId = Number(req.query.categoryId) || ''
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(page, limit)

    return Promise.all([
      GroupTour.findAndCountAll({
        raw: true,
        nest: true,
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {} // 檢查 categoryId 是否為空值
        },
        limit, // 每頁限制
        offset // 每次偏移
      }),
      Category.findAll({ raw: true })
    ])
      .then(([groupTours, categories]) => {
        if (!groupTours) throw new Error("Group tours didn't exist!")
        if (!categories) throw new Error("Categories didn't exist!")

        // findAndCountAll 回傳 rows 資料集合
        const result = groupTours.rows.map(t => ({
          ...t, // ... 展開運算子
          description: t.description.substring(0, 50) // substring 截取字串
        }))
        return res.render('group-tours', {
          groupTours: result,
          categories,
          categoryId,
          pagination: getPagination(page, limit, groupTours.count) // findAndCountAll 回傳 count 資料量
        })
      })
      .catch(err => next(err))
  },
  getGroupTour: (req, res, next) => {
    return GroupTour.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User } // 預先加載 Comment 和 User model
      ]
    })
      .then(groupTour => {
        // console.log(groupTour.toJSON())
        if (!groupTour) throw new Error("Group tour didn't exist!")
        return res.render('group-tour', { groupTour: groupTour.toJSON() }) // 使用 toJSON() 把關聯資料轉成 JSON({{#each}} 陣列才取得到資料)
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
        console.log(groupTours)
        console.log(comments)
        if (!groupTours) throw new Error("Group tours didn't exist!")
        if (!comments) throw new Error("Comments didn't exist!")
        return res.render('feeds', { groupTours, comments })
      })
      .catch(err => next(err))
  }
}

module.exports = groupTourController
