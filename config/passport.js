const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')

const bcrypt = require('bcryptjs')
const { User, GroupTour } = require('../models')

// local strategy
passport.use(new LocalStrategy({
  // 設定客製化選項(user 欄位名稱)
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true // 把 callback 的第一個參數拿到 req 裡，則可以呼叫 req.flash()
},
// 登入認證 user
async (req, email, password, cb) => {
  try {
    const user = await User.findOne({ where: { email } })

    if (!user) throw new Error('Incorrect username or password!')

    const res = await bcrypt.compare(password, user.password)

    if (!res) throw new Error('Incorrect username or password!')

    return cb(null, user)
  } catch (err) {
    console.log(err)
    return cb(err)
  }
}
))

// facebook strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  // 設定 profileFields，指定要取得使用者 Facebook 個人資訊的哪些欄位，取得使用者的電子郵件地址 ('email') 和顯示名稱 ('displayName')
  profileFields: ['email', 'displayName']
},
async (accessToken, refreshToken, profile, cb) => {
  try {
  // console.log('accessToken', accessToken)
    // console.log('profile', profile)
    const { name, email } = profile._json
    const lastName = name.slice(0, 1)
    const firstName = name.slice(1)

    const user = await User.findOne({
      where: { email }
    })
    console.log('user', user)

    if (user) return cb(null, user)

    // 隨機生成密碼(8碼)
    const randomPwd = await Math.random().toString(36).slice(-8)

    const hash = await bcrypt.hash(randomPwd, 10)

    await User.create({ email, password: hash, firstName, lastName })

    return cb(null, user)
  } catch (err) {
    console.log(err)
    return cb(err)
  }
}
))

// 為了節省伺服器空間
// 序列化 serialize(只存 user id 到 session 裡)
passport.serializeUser((user, cb) => cb(null, user.id))
// 反序列化 deserialize(透過 user id 拿出整個 user 物件實例)
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findByPk(id, {
      include: [
        { model: GroupTour, as: 'FavoritedGroupTours' }, // as 指定引入關係的別名
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })

    return cb(null, user.toJSON()) // toJSON() 整理格式
  } catch (err) {
    console.log(err)
    return cb(err)
  }
})

module.exports = passport
