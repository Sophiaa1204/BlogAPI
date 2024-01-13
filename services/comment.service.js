const query = require('../utils/db')
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
const { getPaginationValues } = require('../utils/query')
const userService = require('./user.service')
const articleService = require('./article.service')
const create = async({ userId, articleId, content, commentId = null }) => {
  const insertDateTime = new Date()
  const [row] = await query(
    `INSERT INTO comment (content,user_id, article_id, comment_id,created_at, updated_at) VALUES (?,?,?,?,?,?)`,
    [
      content,
      userId,
      articleId,
      commentId,
      insertDateTime,
      insertDateTime,
    ],
  )
  return getInfoById(row.insertId)
}

const getInfoById = async(id) => {
  const [rows] = await query(
    `SELECT c.id,
       c.content as content,
       c.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.comment_id as parentId,
       ca.id as categoryId,
       ca.name as categoryName,
       c.article_id   as articleId,
       c.created_at    as createdAt,
       c.updated_at    as updatedAt
from comment c
         left join user u on c.user_id = u.id
         left join article a on c.article_id = a.id
         left join category ca on a.category_id = ca.id
where 
c.id=?
AND c.deleted_at IS NULL
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
      'Comment not found',
    )
  }
  const updateDateTime = new Date()
  const { userId, articleId, commentId = null, content } = { ...info, ...data }
  if (!await userService.getInfoById(userId)) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User not found',
    )
  }
  if (!await articleService.getInfoById(articleId)) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Article not found',
    )
  }
  await query(
    `UPDATE comment l SET content=?, user_id=?, article_id=?, comment_id=?, updated_at=? where l.id=? `,
    [
      content,
      userId,
      articleId,
      commentId,
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
      'Comment not found',
    )
  }
  const deleteDateTime = new Date()
  await query(`UPDATE comment l SET deleted_at=? where l.id=? `, [
    deleteDateTime,
    id,
  ])
  return true
}
//mentioned_ids 1,2,3,4 ->[1,2,3,4] => getUserById => email => userService.post(postUser.email,comment,email)
const getList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(`select count(*) as total from comment where deleted_at is NULL;`)
  const [rows] = await query(`SELECT c.id,
         c.content as content,
       c.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.comment_id as parentId,
       ca.id as categoryId,
       ca.name as categoryName,
       c.article_id   as articleId,
       c.created_at    as createdAt,
       c.updated_at    as updatedAt
from comment c
        left join user u on c.user_id = u.id
         left join article a on c.article_id = a.id
         left join category ca on a.category_id = ca.id
where 
c.deleted_at IS NULL
limit ?,?;`, getPaginationValues(pageNum, pageSize))
  return {
    rows,
    total: totalRow[0].total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  }
}

const getAllListByArticleId = async(articleId) => {
  const [rows] = await query(`SELECT c.id,
         c.content as content,
       c.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.comment_id as parentId,
       ca.id as categoryId,
       ca.name as categoryName,
       c.article_id   as articleId,
       c.created_at    as createdAt,
       c.updated_at    as updatedAt
from comment c
         left join user u on c.user_id = u.id
         left join article a on c.article_id = a.id
         left join category ca on a.category_id = ca.id
where
c.article_id=?
AND c.deleted_at IS NULL
order by c.created_at desc;`, [articleId])
  return rows
}
module.exports = {
  create,
  updateById,
  deleteById,
  getList,
  getInfoById,
  getAllListByArticleId,
}
