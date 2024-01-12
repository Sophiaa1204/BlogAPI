const query = require('../utils/db')
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
const { getPaginationValues } = require('../utils/query')

const create = async({ name, sort }) => {
  const insertDateTime = new Date()
  const [row] = await query(
    `INSERT INTO category (name, sort, created_at, updated_at) VALUES (?,?,?,?) `,
    [
      name,
      sort,
      insertDateTime,
      insertDateTime,
    ],
  )
  return getInfoById(row.insertId)
}
const getInfoById = async(id) => {
  const [rows] = await query(
    `SELECT id, name, sort, created_at as createdAt, updated_at as updatedAt from category where category.id =? AND category.deleted_at IS NULL limit 1;`,
    [id],
  )
  return rows.length ? rows[0] : null
}
const updateById = async(id, data) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Category not found',
    )
  }
  const updateDateTime = new Date()
  const { name, sort } = { ...info, ...data }
  await query(
    `UPDATE category SET name=?, sort=?, updated_at=? where category.id=? `, [
      name,
      sort,
      updateDateTime,
      id,
    ])
  return getInfoById(id)
}

const deleteById = async(id) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Category not found',
    )
  }
  const deleteDateTime = new Date()
  await query(`UPDATE category SET deleted_at=? where category.id=? `, [
    deleteDateTime,
    id,
  ])
  return true
}

const getList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(`select count(*) as total from category where deleted_at is NULL;`)
  const [rows] = await query(
    `Select * from category WHERE category.deleted_at IS NULL LIMIT ?,?`,
    getPaginationValues(pageNum, pageSize),
  )
  return {
    rows,
    total: totalRow[0].total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  }
}

module.exports = {
  create,
  updateById,
  deleteById,
  getList,
  getInfoById,
}
