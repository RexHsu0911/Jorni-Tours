const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

// group-tours 路由
router.get('/group-tours/create', adminController.getGroupTourCreate)
router.get('/group-tours', adminController.getGroupTours)
router.post('/group-tours', adminController.postGroupTour)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/admin/group-tours'))

module.exports = router
