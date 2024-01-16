const query = require('../utils/db')
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
const { getPaginationValues } = require('../utils/query')
const userService = require('./user.service')
const articleService = require('./article.service')
const create = async({ userId, articleId }) => {
  const insertDateTime = new Date()
  const [row] = await query(
    `INSERT INTO \`like\` (user_id, article_id, created_at, updated_at) VALUES (?,?,?,?)`,
    [
      userId,
      articleId,
      insertDateTime,
      insertDateTime,
    ],
  )
  return getInfoById(row.insertId)
}

const getInfoById = async(id) => {
  const [rows] = await query(
    `SELECT l.id,
       l.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.id as categoryId,
       c.name as categoryName,
       l.article_id   as articleId,
       l.created_at    as createdAt,
       l.updated_at    as updatedAt
from \`like\` l
         left join user u on l.user_id = u.id
         left join article a on l.article_id = a.id
         left join category c on a.category_id = c.id
where 
l.id=?
AND l.deleted_at IS NULL
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
  const { userId, articleId } = { ...info, ...data }
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
    `UPDATE \`like\` l SET user_id=?, article_id=?, updated_at=? where l.id=? `,
    [
      userId,
      articleId,
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
      'Like not found',
    )
  }
  const deleteDateTime = new Date()
  await query(`UPDATE \`like\` l SET deleted_at=? where l.id=? `, [
    deleteDateTime,
    id,
  ])
  return true
}

const getList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(`select count(*) as total from \`like\` where deleted_at is NULL;`)
  const [rows] = await query(`SELECT l.id,
       l.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.id as categoryId,
       c.name as categoryName,
       l.article_id   as articleId,
       l.created_at    as createdAt,
       l.updated_at    as updatedAt
from \`like\` l
         left join user u on l.user_id = u.id
         left join article a on l.article_id = a.id
         left join category c on a.category_id = c.id
where 
l.deleted_at IS NULL
limit ?,?;`, getPaginationValues(pageNum, pageSize))
  return {
    rows,
    total: totalRow[0].total,
    pageNum:Number(pageNum),
    pageSize:Number(pageSize),
  }
}

const getInfoByArticleId = async(id) => {
  const [rows] = await query(
    `SELECT l.id,
       l.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.id as categoryId,
       c.name as categoryName,
       l.article_id   as articleId,
       l.created_at    as createdAt,
       l.updated_at    as updatedAt
from \`like\` l
         left join user u on l.user_id = u.id
         left join article a on l.article_id = a.id
         left join category c on a.category_id = c.id
where 
l.article_id=?
AND l.deleted_at IS NULL
;`,
    [id],
  )
  return rows

}

const getRecommendArticles = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(`select count(*) as total from \`like\` where deleted_at is NULL;`)
  const [rows] = await query(`SELECT
  COUNT(l.article_id) as likeCount,
        l.article_id   as articleId
  from \`like\` l
            left join user u on l.user_id = u.id
            left join article a on l.article_id = a.id
            left join category c on a.category_id = c.id
  where
  l.deleted_at IS NULL
  GROUP BY l.article_id
  ORDER BY likeCount DESC
  limit ?,?;
  `, getPaginationValues(pageNum, pageSize))
  return {
    rows,
    total: totalRow[0].total,
    pageNum,
    pageSize,
  }
}

const getListByUserId = async({ pageNum = 1, pageSize = 10, userId }) => {
  const [totalRow] = await query(
    `select count(*) as total from \`like\` where user_id=? AND deleted_at is NULL;`,
    [userId],
  )
  const [rows] = await query(`SELECT l.id,
       l.user_id       as userId,
       u.email         as    userEmail,
       u.avatar_url as userAvatarUrl,
       au.id         as    articleUserId,
       au.email         as    articleUserEmail,
       au.avatar_url as articleUserAvatarUrl,
       a.title    as articleTitle,
       a.content as articleContent,
       a.thumbnail_url as articleThumbnailUrl,
       c.id as categoryId,
       c.name as categoryName,
       l.article_id   as articleId,
       l.created_at    as createdAt,
       l.updated_at    as updatedAt
from \`like\` l
         left join user u on l.user_id = u.id
         left join article a on l.article_id = a.id
                  left join user au on au.id = a.user_id
         left join category c on a.category_id = c.id
where
l.user_id=?
AND l.deleted_at IS NULL
limit ?,?;`, [userId, ...getPaginationValues(pageNum, pageSize)])
  return {
    rows,
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
  getInfoByArticleId,
  getRecommendArticles,
  getListByUserId,
}
