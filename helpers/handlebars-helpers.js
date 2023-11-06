const dayjs = require('dayjs')
// Day.js 加載 plugin 的 relativeTime
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(relativeTime)

module.exports = {
  // 取得當年年份作為 currentYear
  currentYear: () => dayjs().year(),
  // 相對時間
  relativeTimeFromNow: t => dayjs(t).fromNow(),
  // 刻意不用箭頭函式，避免綁定 this(可被 handlebar 使用)
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}
