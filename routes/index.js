const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')

// controller
const groupTourController = require('../controllers/group-tour-controller')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')
const favoriteController = require('../controllers/favorite-controller')
const followController = require('../controllers/follow-controller')
const cartController = require('../controllers/cart-controller')
const orderController = require('../controllers/order-controller')

// 透過 auth.js 登入驗證及身分驗證
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

const upload = require('../middleware/multer')

// 設定 admin 路徑
router.use('/admin', authenticatedAdmin, admin)

// register 路由
router.get('/register', userController.getRegister)
router.post('/register', upload.single('avatar'), userController.register)
// login 路由
router.get('/login', userController.getLogin)
// 使用 Passport 做本地身分驗證
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.login)
// logout 路由
router.get('/logout', authenticated, userController.logout)

// user 路由
router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id/edit', authenticated, userController.getUserEdit)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('avatar'), userController.putUser)

// group-tours 路由
router.get('/group-tours/top', groupTourController.getTopGroupTours)
router.get('/group-tours/feeds', groupTourController.getFeeds)
router.get('/group-tours/:id', groupTourController.getGroupTour)
router.get('/group-tours', groupTourController.getGroupTours)

// comment 路由
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, upload.single('image'), commentController.postComment)

// favorite 路由
router.post('/favorite/:groupTourId', authenticated, favoriteController.addFavorite)
router.delete('/favorite/:groupTourId', authenticated, favoriteController.removeFavorite)
router.get('/favorite', authenticated, favoriteController.getFavorite)

// follow 路由
router.post('/follow/:userId', authenticated, followController.addFollow)
router.delete('/follow/:userId', authenticated, followController.removeFollow)

// cart 路由
router.post('/cartItem/:id/add', authenticated, cartController.addCartItem)
router.post('/cartItem/:id/sub', authenticated, cartController.subCartItem)
router.delete('/cartItem/:id', authenticated, cartController.deleteCartItem)
router.get('/cart', authenticated, cartController.getCart)
router.post('/cart', cartController.postCart)

// order 路由
router.get('/orders/:id/payment', authenticated, orderController.getPayment)
router.get('/orders/create', authenticated, orderController.getOrderCreate)
router.post('/orders', authenticated, orderController.postOrder)

// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/group-tours'))
// 設定 errorhandler 路由
router.use('/', generalErrorHandler)

module.exports = router
