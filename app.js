// 載入 dotenv 設定檔
// 要在 passport 之前載入(否則 .env 裡的設定(secret)會讀取不到)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Node 提供原生模組 path 處理檔案路徑
const path = require('path')
const express = require('express')
const { engine } = require('express-handlebars')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')

const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET

// 註冊 express-handlebars 及 helpers/handlebars-helpers
app.engine('hbs', engine({
  extname: '.hbs',
  helpers: handlebarsHelpers
}))
app.set('view engine', 'hbs')
// 設定靜態資源路徑
app.use(express.static('public'))

// 使用 Express 內建的 body-parser
// 使用 POST 動作來傳送資料時，才能解析並傳入 req.body
// 相對於false時，允許查詢字符串的 GET 或 DELETE 動作(req.params.id 參數通常在 URL 中)
app.use(express.urlencoded({ extended: true }))
// 使用 session 將資訊存放在伺服器端
app.use(session({
  secret: SESSION_SECRET, // 驗證 session id
  resave: false,
  saveUninitialized: true, // 強制將未初始化(新的而且未被修改)的session存回 session store
  cookie: { maxAge: 120 * 60 * 1000 } // 儲存時間
  // cookie 的 name 預設值為'connect.sid'
}))
// 初始化 Passport
app.use(passport.initialize())
// 啟動 Passport 的 session 功能
app.use(passport.session())
// 使用自訂的快閃訊息並存到 session 裡
app.use(flash())
// 設定 _method 支援 PUT 跟 DELETE 這兩個 action
app.use(methodOverride('_method'))
// 使用 express.static 來指定路徑
// path.join() 路徑連接在一起
app.use('/upload', express.static(path.join(__dirname, 'upload')))
// 使用本地變數 res.locals 設定 Flash Message
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.loginUser = getUser(req) // 讓 view 取得登入中的使用者狀態
  res.locals.session = req.session // 讓 view 取得 Cart 的 amount 數量

  next()
})
// 使用 routes 路徑
app.use(routes)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
