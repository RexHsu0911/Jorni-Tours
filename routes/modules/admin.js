const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

// 透過 auth.js 身分驗證
const { authenticatedAdmin } = require('../../middleware/auth')

router.get('/group-tours', authenticatedAdmin, adminController.getGroupTours)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/admin/group-tours'))

module.exports = router
