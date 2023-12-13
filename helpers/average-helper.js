// comment rating average
// 參數為陣列及其計算屬性名稱
const getAverage = (data) => {
  const total = data.reduce((prev, curr) => {
    return prev + curr
  }, 0)

  // 有評分，則計算平均值，並保留小數點一位
  const average = data.length ? Number((total / data.length).toFixed(1)) : null

  return average
}

module.exports = getAverage
