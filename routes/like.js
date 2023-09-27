var express = require('express')
var router = express.Router()
const validate = require('../middlewares/validate')
const { likeModel } = require('../model')
const { likeController } = require('../controllers')
router.post('/', validate(likeModel.schema), likeController.create)
router.get('/:id', validate(['id']), likeController.getInfoById)
router.get('/:id/getByArticle', likeController.getInfoByArticleId)

router.put(
  '/:id',
  validate(['id', ...likeModel.schema]),
  likeController.updateInfoById,
)
router.delete('/:id', validate(['id']), likeController.deleteInfoById)
router.get('/list/get', likeController.getList)
router.get('/list/getByUser', likeController.getListByUserId)
module.exports = router
