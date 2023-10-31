const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

router.get('/group-tours', adminController.getGroupTours)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/admin/group-tours'))

module.exports = router
