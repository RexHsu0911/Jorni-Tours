const dayjs = require('dayjs')

module.exports = {
  // 取得當年年份作為 currentYear
  currentYear: () => dayjs().year(),
  // 刻意不用箭頭函式，避免綁定 this(可被 handlebar 使用)
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}
