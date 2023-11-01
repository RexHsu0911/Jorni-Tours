const { User } = require('../models')
// 載入 bcrypt 雜湊演算法
const bcrypt = require('bcryptjs')

const userController = {
  getRegister: (req, res, next) => {
    return res.render('register')
  },
  register: (req, res, next) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) throw new Error("Password don't match!")

    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        // 密碼轉成暗碼(複雜度係數為 10)
        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => {
        req.flash('success_message', '成功註冊帳號！')
        return res.redirect('/login')
      })
      .catch(err => next(err))
  }
}

module.exports = userController
