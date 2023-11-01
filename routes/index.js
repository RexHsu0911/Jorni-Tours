const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')

// controller
const groupTourController = require('../controllers/group-tour-controller')
const userController = require('../controllers/user-controller')

const { generalErrorHandler } = require('../middleware/error-handler')

// 設定 admin 路徑
router.use('/admin', admin)

// register 路由
router.get('/register', userController.getRegister)
router.post('/register', userController.register)

// group-tour 路由
router.get('/group-tours', groupTourController.getGroupTours)

// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/group-tours'))
// 設定 errorhandler 路由
router.use('/', generalErrorHandler)

module.exports = router
