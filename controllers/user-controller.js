const { User } = require('../models')
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
    return User.findByPk(req.params.id, { raw: true })
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        return res.render('users/profile', { user })
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
  }

}

module.exports = userController
