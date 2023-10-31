const express = require('express')
const { engine } = require('express-handlebars')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', engine({ extname: '.hbs' }))
app.set('view engine', 'hbs')

// 設定 routes 路徑
app.use(routes)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
