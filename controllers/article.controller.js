const { articleService, likeService } = require('../services')
const catchAsync = require('../utils/catchAsync')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const crypto = require('../utils/crypto')
const create = catchAsync(async(req, res) => {
  const info = await articleService.create(req.body)
  res.success(info, 'Created successfully')
})

const getInfoById = catchAsync(async(req, res) => {
  res.success(await articleService.getInfoById(req.params.id))
})

const updateInfoById = catchAsync(async(req, res) => {
  res.success(
    await articleService.updateById(req.params.id, req.body),
    'Updated successfully',
  )
})

const deleteInfoById = catchAsync(async(req, res) => {
  res.success(
    await articleService.deleteById(req.params.id),
    'Deleted successfully',
  )
})

const getList = catchAsync(async(req, res) => {
  res.success(await articleService.getList(req.query))
})
const getAll = catchAsync(async(req, res) => {
  res.success(await articleService.getAll())
})

const getRecommendArticles = catchAsync(async(req, res) => {
  const data = await likeService.getRecommendArticles(req.query)

  res.success({
    ...data,
    rows: await Promise.all(data.rows.map(async row => ({
      ...row,
      article: await articleService.getInfoById(row.articleId),
    }))),
  })
})

const getCountByUserId = catchAsync(async(req, res) => {
  res.success(await articleService.getCountByUserId(req.query.userId))
})
const getListByUserId = catchAsync(async(req, res) => {
  res.success(await articleService.getListByUserId(req.query))
})

module.exports = {
  create,
  getInfoById,
  updateInfoById,
  deleteInfoById,
  getList,
  getAll,
  getRecommendArticles,
  getCountByUserId,
  getListByUserId,
}
