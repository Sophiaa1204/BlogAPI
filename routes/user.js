var express = require('express')
var router = express.Router()
const validate = require('../middlewares/validate')
const { userModel } = require('../model')
const { userController } = require('../controllers')
router.post('/login', validate(['email', 'password']), userController.login)
router.post('/signUp', validate(['email', 'password']), userController.signUp)
router.post(
  '/login/admin',
  validate(['username', 'password']),
  userController.loginAdmin,
)
router.post('/', validate(userModel.schema), userController.create)
router.get('/:id', validate(['id']), userController.getInfoById)
router.put(
  '/:id',
  validate(['id', ...userModel.schema]),
  userController.updateInfoById,
)
router.put(
  '/:id/password',
  validate(['id', 'currentPassword', 'newPassword']),
  userController.updatePasswordById,
)

router.delete('/:id', validate(['id']), userController.deleteInfoById)
router.get('/list/get', userController.getList)
router.get('/getCurrentUserInfo', userController.getCurrentUserInfo)
router.put(
  '/updateCurrentUserInfo',
  validate(userModel.schema),
  userController.updateCurrentUserInfo,
)

router.get('/list/random', userController.getRandomList)
module.exports = router
