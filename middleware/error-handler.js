// 接著拋出的 Error 物件
module.exports = {
  generalErrorHandler (err, req, res, next) {
    // err 是不是一個 Error 物件
    if (err instanceof Error) {
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', `${err}`)
    }
    res.redirect('back')
    next(err)
  }
}
