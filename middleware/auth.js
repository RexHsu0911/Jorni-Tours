const { getUser, ensureAuthenticated } = require('../helpers/auth-helpers')

const authenticated = (req, res, next) => {
  // user 是否登入
  if (ensureAuthenticated(req)) return next()

  // 使用者功能，請先登入才能啟用
  req.flash('warning_messages', 'Please login first!')
  return res.redirect('/login')
}

const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    // user 是否為 admin
    if (getUser(req).isAdmin) return next()
    return res.redirect('/')
  } else {
    return res.redirect('/login')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
