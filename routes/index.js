const express = require('express')
const router = express.Router()

const groupTourController = require('../controllers/group-tour-controller')

router.get('/group-tours', groupTourController.getGroupTours)
// 設定 fallback 路由
router.use('/', (req, res) => res.redirect('/group-tours'))

module.exports = router
