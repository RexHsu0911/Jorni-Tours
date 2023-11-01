// 管理使用者驗證
const getUser = req => {
  return req.user || null
}

const ensureAuthenticated = req => {
  return req.isAuthenticated() // Passport 提供的 isAuthenticated() 處理身分驗證
}

module.exports = {
  getUser,
  ensureAuthenticated
}
