const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

// 設定 Passport 的認證策略
passport.use(new LocalStrategy(
  {
  // 設定客製化選項(user 欄位名稱)
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // 把 callback 的第一個參數拿到 req 裡，則可以呼叫 req.flash()
  },
  // 登入認證 user
  function (req, email, password, cb) {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) throw new Error('帳號或密碼輸入錯誤！')
        bcrypt.compare(password, user.password)
          .then(res => {
            if (!res) throw new Error('帳號或密碼輸入錯誤！')
          })
        return cb(null, user)
      })
      .catch(err => cb(err))
  }
))

// 為了節省伺服器空間
// 序列化 serialize(只存 user id 到 session 裡)
passport.serializeUser((user, cb) => cb(null, user.id))
// 反序列化 deserialize(透過 user id 拿出整個 user 物件實例)
passport.deserializeUser((id, cb) => {
  return User.findByPk(id)
    .then(user => cb(null, user.toJSON())) // toJSON() 整理格式
    .catch(err => cb(err))
})

module.exports = passport
