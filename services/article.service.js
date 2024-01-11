const query = require('../utils/db')
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
const { getPaginationValues } = require('../utils/query')
const userService = require('./user.service')
const categoryService = require('./category.service')
const likeService = require('./like.service')
const commentService = require('./comment.service')
const create = async({
  title,
  thumbnailUrl,
  content,
  userId,
  categoryId,
  isPublish,
}) => {
  const insertDateTime = new Date()
  const [row] = await query(
    `INSERT INTO article (title, thumbnail_url, content, user_id, category_id, is_publish, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`,
    [
      title,
      thumbnailUrl,
      content,
      userId,
      categoryId,
      isPublish,
      insertDateTime,
      insertDateTime,
    ],
  )
  return getInfoById(row.insertId)
}

const getInfoById = async(id) => {
  const [rows] = await query(
    `SELECT a.id,
       title,
       thumbnail_url as thumbnailUrl,
       content,
       user_id       as userId,
       u.email as userEmail,
       u.avatar_url as userAvatarUrl,
       category_id   as categoryId,
       c.name as categoryName,
       c.sort as categorySort,
       is_publish    as isPublish,
       a.created_at    as createdAt,
       a.updated_at    as updatedAt
from article a
         left join user u on a.user_id = u.id
         left join category c on a.category_id = c.id
where a.id = ?
  AND a.deleted_at IS NULL
limit 1;`,
    [id],
  )
  return rows.length ? rows[0] : null
}

const updateById = async(id, data) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Article not found',
    )
  }
  const updateDateTime = new Date()
  const {
    title,
    thumbnailUrl,
    content,
    userId,
    categoryId,
    isPublish,
  } = { ...info, ...data }
  if (!await userService.getInfoById(userId)) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User not found',
    )
  }
  if (!await categoryService.getInfoById(categoryId)) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Category not found',
    )
  }
  await query(
    `UPDATE article SET title=?, thumbnail_url=?, content=?, user_id=?, category_id=?, is_publish=?, updated_at=? where article.id=? `,
    [
      title,
      thumbnailUrl,
      content,
      userId,
      categoryId,
      isPublish,
      updateDateTime,
      id,
    ],
  )
  return getInfoById(id)
}

const deleteById = async(id) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Article not found',
    )
  }
  const deleteDateTime = new Date()
  await query(`UPDATE article SET deleted_at=? where article.id=? `, [
    deleteDateTime,
    id,
  ])
  return true
}

const getList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(`select count(*) as total from article where deleted_at is NULL;`)
  const [rows] = await query(`SELECT a.id,
    title,
       thumbnail_url as thumbnailUrl,
       content,
       user_id       as userId,
       u.email as userEmail,
       u.avatar_url as userAvatarUrl,
       category_id   as categoryId,
       c.name as categoryName,
       c.sort as categorySort,
       is_publish    as isPublish,
       a.created_at    as createdAt,
       a.updated_at    as updatedAt
from article a
         left join user u on a.user_id = u.id
         left join category c on a.category_id = c.id
where a.deleted_at IS NULL
limit ?,?;`, getPaginationValues(pageNum, pageSize))
  return {
    rows: await Promise.all(rows.map(async row => ({
      ...row,
      likes: await likeService.getInfoByArticleId(row.id),
    }))),
    total: totalRow[0].total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  }
}

const getAll = async() => {
  const [rows] = await query(`SELECT a.id,
    title,
       thumbnail_url as thumbnailUrl,
       content,
       user_id       as userId,
       u.email as userEmail,
       u.avatar_url as userAvatarUrl,
       category_id   as categoryId,
       c.name as categoryName,
       c.sort as categorySort,
       is_publish    as isPublish,
       a.created_at    as createdAt,
       a.updated_at    as updatedAt
from article a
         left join user u on a.user_id = u.id
         left join category c on a.category_id = c.id
where a.deleted_at IS NULL`)
  return await Promise.all(rows.map(async row => ({
    ...row,
    likes: await likeService.getInfoByArticleId(row.id),
    comments: await commentService.getAllListByArticleId(row.id),
  })))
}

const getCountByUserId = async(userId) => {
  const [rows] = await query(
    `SELECT count(*) as total from article where user_id=? and deleted_at is NULL`,
    [userId],
  )
  console.log(rows, userId)
  return rows[0].total
}
const getListByUserId = async({ userId, pageSize, pageNum }) => {
  const [totalRow] = await query(
    `select count(*) as total from article where user_id=? and deleted_at is NULL;`,
    [userId],
  )
  const [rows] = await query(`SELECT a.id,
    title,
       thumbnail_url as thumbnailUrl,
       content,
       user_id       as userId,
       u.email as userEmail,
       u.avatar_url as userAvatarUrl,
       category_id   as categoryId,
       c.name as categoryName,
       c.sort as categorySort,
       is_publish    as isPublish,
       a.created_at    as createdAt,
       a.updated_at    as updatedAt
from article a
         left join user u on a.user_id = u.id
         left join category c on a.category_id = c.id
where a.deleted_at IS NULL
and a.user_id=?
limit ?,?;`, [userId, ...getPaginationValues(pageNum, pageSize)])
  console.log(getPaginationValues(pageNum, pageSize))
  return {
    rows: await Promise.all(rows.map(async row => ({
      ...row,
      likes: await likeService.getInfoByArticleId(row.id),
      comments: await commentService.getAllListByArticleId(row.id),
    }))),
    total: totalRow[0].total,
    pageNum,
    pageSize,
  }
}

module.exports = {
  create,
  updateById,
  deleteById,
  getList,
  getInfoById,
  getAll,
  getCountByUserId,
  getListByUserId,
}
