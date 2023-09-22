var express = require('express')
var router = express.Router()
const validate = require('../middlewares/validate')
const { articleModel } = require('../model')
const { articleController, userController } = require('../controllers')
router.post('/', validate(articleModel.schema), articleController.create)
router.get('/:id', validate(['id']), articleController.getInfoById)
router.put(
  '/:id',
  validate(['id', ...articleModel.schema]),
  articleController.updateInfoById,
)
router.delete('/:id', validate(['id']), articleController.deleteInfoById)
router.get('/list/get', articleController.getList)
router.get('/list/all', articleController.getAll)
router.get('/list/recommend', articleController.getRecommendArticles)
router.get('/user/count', articleController.getCountByUserId)
router.get('/user/list', articleController.getListByUserId)

module.exports = router
