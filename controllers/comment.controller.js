const { commentService } = require('../services')
const catchAsync = require('../utils/catchAsync')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const crypto = require('../utils/crypto')
const create = catchAsync(async(req, res) => {
  const info = await commentService.create(req.body)
  res.success(info, 'Created successfully')
})

const getInfoById = catchAsync(async(req, res) => {
  res.success(await commentService.getInfoById(req.params.id))
})

const updateInfoById = catchAsync(async(req, res) => {
  res.success(
    await commentService.updateById(req.params.id, req.body),
    'Updated successfully',
  )
})

const deleteInfoById = catchAsync(async(req, res) => {
  res.success(
    await commentService.deleteById(req.params.id),
    'Deleted successfully',
  )
})

const getList = catchAsync(async(req, res) => {
  res.success(await commentService.getList(req.body))
})

const getListByArticleId = catchAsync(async(req, res) => {
  res.success(await commentService.getAllListByArticleId(req.query.articleId))
})
module.exports = {
  create,
  getInfoById,
  updateInfoById,
  deleteInfoById,
  getList,
  getListByArticleId,
}
