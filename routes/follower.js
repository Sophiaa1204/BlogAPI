var express = require('express')
var router = express.Router()
const validate = require('../middlewares/validate')
const { followerModel } = require('../model')
const { followerController } = require('../controllers')

router.post('/', validate(followerModel.schema), followerController.create)
router.delete('/:id', validate(['id']), followerController.deleteById)
router.get('/list/following', followerController.getFollowingList)
router.get('/list/follower', followerController.getFollowerList)
router.get('/list/get', followerController.getList)
router.get('/list/all', followerController.getAllList)
router.get('/user/count', followerController.getUserCount)
router.get('/list/connection', followerController.getConnectionList)
router.get('/:id', validate(['id']), followerController.getInfoById)

module.exports = router
