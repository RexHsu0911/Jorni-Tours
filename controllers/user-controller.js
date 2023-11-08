const { User, Comment, GroupTour } = require('../models')
// 載入 bcrypt 雜湊演算法
const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userController = {
  getRegister: (req, res) => {
    return res.render('register')
  },
  register: (req, res, next) => {
    const { firstName, lastName, email, password, passwordCheck, gender, birthday, country, phone, description } = req.body
    if (!firstName) throw new Error('First name is required!')
    if (!lastName) throw new Error('Last name is required!')
    if (password !== passwordCheck) throw new Error("Password don't match!")
    const { file } = req

    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        // 密碼轉成暗碼(複雜度係數為 10)
        return Promise.all([
          bcrypt.hash(password, 10),
          imgurFileHandler(file)
        ])
          .then(([hash, filePath]) => {
            return User.create({
              firstName,
              lastName,
              email,
              password: hash,
              gender,
              birthday,
              country,
              phone,
              avatar: filePath || null,
              description
            })
          })
      })
      .then(() => {
        req.flash('success_messages', 'Visitor has successfully registered an account!')
        return res.redirect('/login')
      })
      .catch(err => next(err))
  },
  getLogin: (req, res) => {
    return res.render('login')
  },
  login: (req, res) => {
    req.flash('success_messages', 'User has successfully logged in!')
    return res.redirect('/group-tours')
  },
  logout: (req, res) => {
    req.flash('success_messages', 'User has successfully logged out!')
    // Passport 提供的 logout() 把 user id 對應的 session 清除
    req.logout()
    return res.redirect('/login')
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: GroupTour },
        { model: GroupTour, as: 'FavoritedGroupTours' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")

        const result = {
          ...user.toJSON(),
          // reduce 對陣列轉化為單一值
          // acc 是累加器，初始值為 []
          commentedGroupTours: user.Comments?.reduce((acc, comment) => {
            // 檢查 groupTour 不存在重複，則回傳到 user.commentedGroupTours
            if (!acc.some(groupTour => groupTour.id === comment.groupTourId)) {
              acc.push(comment.GroupTour.toJSON())
            }
            return acc
          }, []),
          isFollowed: req.user?.Followings.some(fu => fu.id === user.id)
        }
        // console.log(result)

        return res.render('users/profile', { user: result })
      })
      .catch(err => next(err))
  },
  getUserEdit: (req, res, next) => {
    return User.findByPk(req.params.id, { raw: true })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { firstName, lastName, gender, birthday, country, phone, description } = req.body
    if (req.user.id !== Number(req.params.id)) throw new Error('User can only edit your own profile!')
    if (!firstName) throw new Error('User first name is required!')
    if (!lastName) throw new Error('User last name is required!')
    const { file } = req

    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")

        return user.update({
          firstName,
          lastName,
          gender,
          birthday,
          country,
          phone,
          avatar: filePath || user.avatar,
          description
        })
      })
      .then(user => {
        req.flash('success_messages', 'User profile was successfully updated!')
        return res.redirect(`/users/${user.id}`)
      })
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        if (!users) throw new Error("Users didn't exist!")

        const result = users.map(u => ({
          ...u.toJSON(),
          followerCount: u.Followers.length,
          isFollowed: req.user?.Followings.some(fu => fu.id === u.id) // 目前登入 user 是否已追蹤該 user 物件
        }))
          // 使用 sort 排序 followerCount 由大排到小(若 b - a 為正數，則 b 排到前面)
          .sort((a, b) => b.followerCount - a.followerCount)
          .slice(0, 10)

        return res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  }
}

module.exports = userController
