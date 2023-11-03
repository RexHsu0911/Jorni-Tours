const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

// group-tours 路由
// 注意上下順序，會先被解讀成 :id
router.get('/group-tours/create', adminController.getGroupTourCreate)
router.get('/group-tours/:id/edit', adminController.getGroupTourEdit)
router.get('/group-tours/:id', adminController.getGroupTour)
router.put('/group-tours/:id', adminController.putGroupTour)
router.delete('/group-tours/:id', adminController.deleteGroupTour)
router.get('/group-tours', adminController.getGroupTours)
router.post('/group-tours', adminController.postGroupTour)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/admin/group-tours'))

module.exports = router
