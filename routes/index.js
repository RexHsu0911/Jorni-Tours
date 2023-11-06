const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')

// controller
const groupTourController = require('../controllers/group-tour-controller')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')

// 透過 auth.js 登入驗證及身分驗證
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

const upload = require('../middleware/multer')

// 設定 admin 路徑
router.use('/admin', authenticatedAdmin, admin)

// register 路由
router.get('/register', userController.getRegister)
router.post('/register', userController.register)
// login 路由
router.get('/login', userController.getLogin)
// 使用 Passport 做本地身分驗證
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.login)
// logout 路由
router.get('/logout', userController.logout)

// group-tours 路由
router.get('/group-tours/:id', authenticated, groupTourController.getGroupTour)
router.get('/group-tours', authenticated, groupTourController.getGroupTours)

// comment 路由
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, upload.single('image'), commentController.postComment)

// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/group-tours'))
// 設定 errorhandler 路由
router.use('/', generalErrorHandler)

module.exports = router
