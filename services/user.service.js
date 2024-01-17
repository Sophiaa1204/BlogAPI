const query = require('../utils/db')
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
const { getPaginationValues } = require('../utils/query')
const crypto = require('../utils/crypto')
const isEmailTaken = async(email) => {
  const [rows] = await query(
    `SELECT u.email from user u WHERE u.email = ? AND u.deleted_at IS NULL;`, [email])
  return !!rows.length
}
const getInfoByEmail = async(email) => {
  const [rows] = await query(
    `SELECT * from user u WHERE u.email = ? AND u.deleted_at IS NULL;`, [email])
  return rows[0]
}

const create = async({ email, password, gender, avatarUrl, description }) => {
  const insertDateTime = new Date()
  if (await isEmailTaken(email)) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email was taken')
  }
  const [row] = await query(
    `INSERT INTO user (email, password, gender, avatar_url, description, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`,
    [
      email,
      password,
      gender,
      avatarUrl,
      description,
      insertDateTime,
      insertDateTime,
    ],
  )
  return getInfoById(row.insertId)
}
const getInfoById = async(id) => {
  const [rows] = await query(
    `SELECT id, email, password, gender, avatar_url as avatarUrl, description, created_at as createdAt, updated_at as updatedAt from user where user.id =? AND user.deleted_at IS NULL limit 1;`,
    [id],
  )
  return rows.length ? rows[0] : null
}
const updateById = async(id, data) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User not found',
    )
  }
  const updateDateTime = new Date()
  const {
    email,
    password,
    gender,
    avatarUrl,
    description,
  } = { ...info, ...data }
  await query(
    `UPDATE user SET email=?, password=?, gender=?, avatar_url=?, description=?, updated_at=? where user.id=? `,
    [email, password, gender, avatarUrl, description, updateDateTime, id],
  )
  return getInfoById(id)
}
const updatePasswordById = async(id, data) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User not found',
    )
  }
  if (crypto.isSame(data.currentPassword, info.password)) {
    const updateDateTime = new Date()
    const { newPassword } = data
    await query(`UPDATE user SET password=?, updated_at=? where user.id=? `, [
      newPassword,
      updateDateTime,
      id,
    ])
  }

  return getInfoById(id)
}

const deleteById = async(id) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User not found',
    )
  }
  const deleteDateTime = new Date()
  await query(`UPDATE user SET deleted_at=? where user.id=? `, [
    deleteDateTime,
    id,
  ])
  return true
}

const getList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(`select count(*) as total from user where deleted_at is NULL;`)
  const [rows] = await query(
    `Select * from user WHERE user.deleted_at IS NULL LIMIT ?,?`,
    getPaginationValues(pageNum, pageSize),
  )
  return {
    rows,
    total: totalRow[0].total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  }
}

const getRandomList = async({ pageNum = 1, pageSize = 10, userId }) => {
  const [totalRow] = await query(
    `select count(*) as total from user where id!=? AND deleted_at is NULL;`, [userId])
  const [rows] = await query(
    `Select
    u.id,
    u.email,
    u.gender,
    u.description,
    u.avatar_url AS avatarUrl,
    f.id AS isFollow
    from user u left join follower f on f.from_user_id=? AND f.to_user_id=u.id AND f.deleted_at IS NULL WHERE u.id!=? AND u.deleted_at IS NULL order by RAND() LIMIT ?,?`,
    [userId, userId, ...getPaginationValues(pageNum, pageSize)],
  )

  return {
    rows,
    total: totalRow[0].total,
    pageNum,
    pageSize,
  }
}
module.exports = {
  isEmailTaken,
  create,
  updateById,
  deleteById,
  getList,
  getInfoById,
  getInfoByEmail,
  updatePasswordById,
  getRandomList,
}
