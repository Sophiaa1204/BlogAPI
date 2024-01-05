const { categoryService } = require('../services')
const catchAsync = require('../utils/catchAsync')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const crypto = require('../utils/crypto')
const create = catchAsync(async(req, res) => {
  const info = await categoryService.create(req.body)
  res.success(info, 'Created successfully')
})

const getInfoById = catchAsync(async(req, res) => {
  res.success(await categoryService.getInfoById(req.params.id))
})

const updateInfoById = catchAsync(async(req, res) => {
  res.success(await categoryService.updateById(req.params.id, req.body), 'Updated successfully')
})

const deleteInfoById = catchAsync(async(req, res) => {
  res.success(await categoryService.deleteById(req.params.id), 'Deleted successfully')
})

const getList = catchAsync(async(req, res) => {
  res.success(await categoryService.getList(req.query))
})

module.exports = {
  create,
  getInfoById,
  updateInfoById,
  deleteInfoById,
  getList,
}
