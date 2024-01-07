const { followerService } = require('../services')
const catchAsync = require('../utils/catchAsync')
const create = catchAsync(async(req, res) => {
  const info = await followerService.create(req.body)
  res.success(info, 'Created successfully')
})

const deleteById = catchAsync(async(req, res) => {
  res.success(
    await followerService.deleteById(req.params.id),
    'Deleted successfully',
  )
})

const getFollowingList = catchAsync(async(req, res) => {
  res.success(await followerService.getFollowingList(req.query))
})

const getFollowerList = catchAsync(async(req, res) => {
  res.success(await followerService.getFollowerList(req.query))
})

const getAllList = catchAsync(async(req, res) => {
  res.success(await followerService.getAllList(req.query))
})

const getUserCount = catchAsync(async(req, res) => {
  res.success(await followerService.getUserCount(req.query.userId))
})

const getInfoById = catchAsync(async(req, res) => {
  res.success(await followerService.getInfoById(req.params.id))
})
const getConnectionList = catchAsync(async(req, res) => {
  res.success(await followerService.getConnectionList(req.query))
})

const getList = catchAsync(async(req, res) => {
  res.success(await followerService.getList(req.query))
})
module.exports = {
  create,
  deleteById,
  getFollowingList,
  getFollowerList,
  getAllList,
  getUserCount,
  getInfoById,
  getConnectionList,
  getList
}
