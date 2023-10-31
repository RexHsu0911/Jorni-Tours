const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')

const groupTourController = require('../controllers/group-tour-controller')

// 設定 admin 路徑
router.use('/admin', admin)

router.get('/group-tours', groupTourController.getGroupTours)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/group-tours'))

module.exports = router
