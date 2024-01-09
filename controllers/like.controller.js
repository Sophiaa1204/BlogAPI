const { likeService, commentService } = require('../services')
const catchAsync = require('../utils/catchAsync')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const crypto = require('../utils/crypto')
const create = catchAsync(async(req, res) => {
  const info = await likeService.create(req.body)
  res.success(info, 'Created successfully')
})

const getInfoById = catchAsync(async(req, res) => {
  res.success(await likeService.getInfoById(req.params.id))
})

const getInfoByArticleId = catchAsync(async(req, res) => {
  res.success(await likeService.getInfoByArticleId(req.params.id))
})

const updateInfoById = catchAsync(async(req, res) => {
  res.success(
    await likeService.updateById(req.params.id, req.body),
    'Updated successfully',
  )
})

const deleteInfoById = catchAsync(async(req, res) => {
  res.success(
    await likeService.deleteById(req.params.id),
    'Deleted successfully',
  )
})

const getList = catchAsync(async(req, res) => {
  res.success(await likeService.getList(req.body))
})

const getListByUserId = catchAsync(async(req, res) => {
  const { rows, ...data } = await likeService.getListByUserId(req.query)
  res.success({
    ...data,
    rows: await Promise.all(rows.map(async row => ({
      ...row,
      likes: await likeService.getInfoByArticleId(row.articleId),
      comments: await commentService.getAllListByArticleId(row.articleId),
    }))),
  })
})
module.exports = {
  create,
  getInfoById,
  updateInfoById,
  deleteInfoById,
  getList,
  getInfoByArticleId,
  getListByUserId,
}
