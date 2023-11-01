const { User } = require('../models')
// 載入 bcrypt 雜湊演算法
const bcrypt = require('bcryptjs')

const userController = {
  getRegister: (req, res) => {
    return res.render('register')
  },
  register: (req, res) => {
    const { name, email, password } = req.body
    // 密碼轉成暗碼(複雜度係數為 10)
    return bcrypt.hash(password, 10)
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => {
        return res.redirect('/register')
      })
  }
}

module.exports = userController
