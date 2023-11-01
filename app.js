const express = require('express')
const { engine } = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')

const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'

// 註冊
app.engine('hbs', engine({
  extname: '.hbs',
  helpers: handlebarsHelpers
}))
app.set('view engine', 'hbs')

// 使用 Express 內建的 body-parser
// 使用 POST 動作來傳送資料時，才能解析並傳入 req.body
// 相對於false時，允許查詢字符串的 GET 或 DELETE 動作(req.params.id 參數通常在 URL 中)
app.use(express.urlencoded({ extended: true }))
// 使用 session 將資訊存放在伺服器端
app.use(session({
  secret: SESSION_SECRET, // 驗證 session id
  resave: false,
  saveUninitialized: false
}))
// 初始化 Passport
app.use(passport.initialize())
// 啟動 Passport 的 session 功能
app.use(passport.session())
// 使用自訂的快閃訊息並存到 session 裡
app.use(flash())
// 使用本地變數 res.locals 設定 Flash Message
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.loginUser = getUser(req) // 讓 view 取得登入中的使用者狀態
  next()
})
// 使用 routes 路徑
app.use(routes)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
