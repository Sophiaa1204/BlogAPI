const { userService } = require('../services')
const catchAsync = require('../utils/catchAsync')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const crypto = require('../utils/crypto')
const token = require('../utils/token')

//TODO encryptedPassword
const login = catchAsync(async(req, res) => {
  const { email, password } = req.body
  const info = await userService.getInfoByEmail(email)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      '账号密码错误',
    )
  }
  if (crypto.isSame(password, info.password)) {
    res.success(token.sign({
      ...info,
      avatarUrl: info.avatar_url,
    }), 'Login successfully')
  } else {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, '账号密码错误')
  }
})
const create = catchAsync(async(req, res) => {
  const info = await userService.create(req.body)
  //TODO generate token
  res.success(info, 'Created successfully')
})

//TODO encryptedPassword
const signUp = catchAsync(async(req, res) => {
  const info = await userService.create(req.body)
  //TODO generate token
  res.success(info, 'Sign-up successfully')
})

const getCurrentUserInfo = catchAsync(async(req, res) => {
  //TODO req.user.id
  res.success(await userService.getInfoById(req.user.id))
})

const updateCurrentUserInfo = catchAsync(async(req, res) => {
  //TODO req.user.id
  res.success(await userService.updateById(req.user.id, req.body))
})

const getInfoById = catchAsync(async(req, res) => {
  res.success(await userService.getInfoById(req.params.id))
})

const updateInfoById = catchAsync(async(req, res) => {
  const info = await userService.updateById(req.params.id, req.body)
  res.success(token.sign(info), 'Updated successfully')
})

const updatePasswordById = catchAsync(async(req, res) => {
  const info = await userService.updatePasswordById(req.params.id, req.body)
  res.success(token.sign(info), 'Updated successfully')
})

const deleteInfoById = catchAsync(async(req, res) => {
  res.success(
    await userService.deleteById(req.params.id),
    'Deleted successfully',
  )
})

const getList = catchAsync(async(req, res) => {
  res.success(await userService.getList(req.body))
})

const getRandomList = catchAsync(async(req, res) => {
  res.success(await userService.getRandomList(req.query))
})

const loginAdmin = catchAsync(async(req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'admin') {
    res.success(token.sign({
      id: 1,
      username: 'admin',
      role: 'admin',
    }), 'Login successfully')
  } else {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, '账号密码错误')
  }
})
module.exports = {
  login,
  create,
  signUp,
  getCurrentUserInfo,
  updateCurrentUserInfo,
  getInfoById,
  updateInfoById,
  deleteInfoById,
  getList,
  updatePasswordById,
  getRandomList,
  loginAdmin,
}
