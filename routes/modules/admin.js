const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

const upload = require('../../middleware/multer')

// users 路由
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

// group-tours 路由
// 注意上下順序，會先被解讀成 :id
router.get('/group-tours/create', adminController.getGroupTourCreate)
router.get('/group-tours/:id/edit', adminController.getGroupTourEdit)
router.get('/group-tours/:id', adminController.getGroupTour)
router.put('/group-tours/:id', upload.single('image'), adminController.putGroupTour)
router.delete('/group-tours/:id', adminController.deleteGroupTour)
router.get('/group-tours', adminController.getGroupTours)
router.post('/group-tours', upload.single('image'), adminController.postGroupTour)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/admin/group-tours'))

module.exports = router
