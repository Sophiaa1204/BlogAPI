var express = require('express')
var router = express.Router()
const validate = require('../middlewares/validate')
const { commentModel } = require('../model')
const { commentController } = require('../controllers')
router.post('/', validate(commentModel.schema), commentController.create)
router.get('/:id', validate(['id']), commentController.getInfoById)
router.put(
  '/:id',
  validate(['id', ...commentModel.schema]),
  commentController.updateInfoById,
)
router.delete('/:id', validate(['id']), commentController.deleteInfoById)
router.get('/list/get', commentController.getList)
router.get('/list/getByArticleId', commentController.getListByArticleId)
module.exports = router
