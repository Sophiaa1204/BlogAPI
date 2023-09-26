var express = require('express')
var router = express.Router()
router.use('/user', require('./user'))
router.use('/category', require('./category'))
router.use('/article', require('./article'))
router.use('/public', require('./public'))
router.use('/like', require('./like'))
router.use('/comment', require('./comment'))
router.use('/follower', require('./follower'))
module.exports = router
