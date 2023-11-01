const express = require('express')
const { engine } = require('express-handlebars')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', engine({ extname: '.hbs' }))
app.set('view engine', 'hbs')

// 使用 Express 內建的 body-parser
// 使用 POST 動作來傳送資料時，才能解析並傳入 req.body
// 相對於false時，允許查詢字符串的 GET 或 DELETE 動作(req.params.id 參數通常在 URL 中)
app.use(express.urlencoded({ extended: true }))
// 設定 routes 路徑
app.use(routes)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
