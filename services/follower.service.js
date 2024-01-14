const query = require('../utils/db')
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
const { getPaginationValues } = require('../utils/query')

const create = async({ fromUserId, toUserId }) => {
  const insertDateTime = new Date()
  const [row] = await query(
    `INSERT INTO follower (from_user_id,to_user_id, created_at, updated_at) VALUES (?,?,?,?) `,
    [
      fromUserId,
      toUserId,
      insertDateTime,
      insertDateTime,
    ],
  )
  return getInfoById(row.insertId)
}

const getInfoById = async(id) => {
  const [rows] = await query(
    `SELECT f.id,
       from_user_id  as fromUserId,
       to_user_id    as toUserId,
       f.created_at  as createdAt,
       f.updated_at  as updatedAt,
       fu.email      AS fromUserEmail,
       fu.avatar_url AS fromUserAvatarUrl,
       fu.description AS fromUserDescription,
       fu.gender AS fromUserGender,
       tu.email      AS toUserEmail,
       tu.avatar_url AS toUserAvatarUrl,
       tu.description AS toUserDescription,
       tu.gender AS toUserGender
from follower f
         left join user fu on fu.id = f.from_user_id
         left join user tu on tu.id = f.to_user_id
where f.id = ?
  AND fu.deleted_at IS NULL
limit 1;`,
    [id],
  )
  return rows.length ? rows[0] : null
}

const deleteById = async(id) => {
  const info = await getInfoById(id)
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Follower not found',
    )
  }
  const deleteDateTime = new Date()
  await query(`UPDATE follower SET deleted_at=? where follower.id=? `, [
    deleteDateTime,
    id,
  ])
  return true
}

const getFollowingList = async({ pageNum = 1, pageSize = 10, userId }) => {
  const [totalRow] = await query(
    `select count(*) as total from follower where from_user_id=? AND deleted_at is NULL;`,
    [userId],
  )
  const [rows] = await query(
    `SELECT f.id,
       from_user_id  as fromUserId,
       to_user_id    as toUserId,
       f.created_at  as createdAt,
       f.updated_at  as updatedAt,
       fu.email      AS fromUserEmail,
       fu.avatar_url AS fromUserAvatarUrl,
       fu.description AS fromUserDescription,
       fu.gender AS fromUserGender,
       tu.email      AS toUserEmail,
       tu.avatar_url AS toUserAvatarUrl,
       tu.description AS toUserDescription,
       tu.gender AS toUserGender
FROM follower f
         left join user fu on fu.id = f.from_user_id
         left join user tu on tu.id = f.to_user_id 
         WHERE from_user_id=? AND f.deleted_at IS NULL LIMIT ?,?`,
    [userId, ...getPaginationValues(pageNum, pageSize)],
  )
  return {
    rows,
    total: totalRow.length ? totalRow[0].total : 0,
    pageNum,
    pageSize,
  }
}

const getFollowerList = async({ pageNum = 1, pageSize = 10, userId }) => {
  const [totalRow] = await query(
    `select count(*) as total from follower where to_user_id=? AND deleted_at is NULL;`,
    [userId],
  )
  const [rows] = await query(
    `SELECT f.id,
       from_user_id  as fromUserId,
       to_user_id    as toUserId,
       f.created_at  as createdAt,
       f.updated_at  as updatedAt,
       fu.email      AS fromUserEmail,
       fu.avatar_url AS fromUserAvatarUrl,
       fu.description AS fromUserDescription,
       fu.gender AS fromUserGender,
       tu.email      AS toUserEmail,
       tu.avatar_url AS toUserAvatarUrl,
       tu.description AS toUserDescription,
       tu.gender AS toUserGender
FROM follower f
         left join user fu on fu.id = f.from_user_id
         left join user tu on tu.id = f.to_user_id 
         WHERE to_user_id=? AND f.deleted_at IS NULL LIMIT ?,?`,
    [userId, ...getPaginationValues(pageNum, pageSize)],
  )
  return {
    rows,
    total: totalRow.length ? totalRow[0].total : 0,
    pageNum,
    pageSize,
  }
}

const getConnectionList = async({ pageNum = 1, pageSize = 10, userId }) => {
  //fromUserId=userId get all records then filter toUserId.fromUserId=userId
  const [totalRow] = await query(
    `SELECT count(*) AS total from follower f, follower sf where f.from_user_id=sf.to_user_id AND f.to_user_id=sf.from_user_id AND f.deleted_at IS NULL AND sf.deleted_at IS NULL AND f.from_user_id=? group by f.id`,
    [userId],
  )
  const [rows] = await query(
    `SELECT f.id          AS id,
       f.to_user_id  AS toUserId,
       u.avatar_url  AS toUserAvatarUrl,
       u.email       AS toUserEmail,
       u.gender      AS toUserGender,
       u.description AS toUserDescription
from follower f left join user u on f.to_user_id = u.id,
     follower sf

where f.from_user_id = sf.to_user_id
  AND f.to_user_id = sf.from_user_id
  AND f.deleted_at IS NULL
  AND sf.deleted_at IS NULL
  AND f.from_user_id = ?
group by f.id
LIMIT ?,?;`
    , [userId, ...getPaginationValues(pageNum, pageSize)],
  )
  return {
    rows,
    total: totalRow.length ? totalRow[0].total : 0,
    pageNum,
    pageSize,
  }
}
const getAllList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(
    `select count(*) as total from follower where deleted_at is NULL;`,
    [],
  )

  const [rows] = await query(
    `SELECT f.id,
       from_user_id  as fromUserId,
       to_user_id    as toUserId,
       f.created_at  as createdAt,
       f.updated_at  as updatedAt,
       fu.email      AS fromUserEmail,
       fu.avatar_url AS fromUserAvatarUrl,
       fu.description AS fromUserDescription,
       fu.gender AS fromUserGender,
       tu.email      AS toUserEmail,
       tu.avatar_url AS toUserAvatarUrl,
       tu.description AS toUserDescription,
       tu.gender AS toUserGender
FROM follower f
         left join user fu on fu.id = f.from_user_id
         left join user tu on tu.id = f.to_user_id 
         WHERE follower.deleted_at IS NULL LIMIT ?,?`,
    getPaginationValues(pageNum, pageSize),
  )

  return {
    rows,
    total: totalRow[0].total,
    pageNum,
    pageSize,
  }
}

const getUserCount = async(userId) => {
  const [totalFollowingRow] = await query(
    `select count(*) as total from follower where from_user_id=? AND deleted_at is NULL;`,
    [userId],
  )
  const [totalFollowerRow] = await query(
    `select count(*) as total from follower where to_user_id=? AND deleted_at is NULL;`,
    [userId],
  )
  const [totalConnectionRow] = await query(
    `SELECT count(*) as total from follower f, follower sf where f.from_user_id=sf.to_user_id AND f.to_user_id=sf.from_user_id AND f.deleted_at IS NULL AND sf.deleted_at IS NULL AND f.from_user_id=? group by f.id`,
    [userId],
  )

  return {
    totalFollowing: totalFollowingRow.length ? totalFollowingRow[0].total : 0,
    totalFollower: totalFollowerRow.length ? totalFollowerRow[0].total : 0,
    totalConnection: totalConnectionRow.length
      ? totalConnectionRow[0].total
      : 0,
  }
}

const getList = async({ pageNum = 1, pageSize = 10 }) => {
  const [totalRow] = await query(
    `select count(*) as total from follower where deleted_at is NULL;`,
    [],
  )

  const [rows] = await query(
    `SELECT f.id,
       from_user_id  as fromUserId,
       to_user_id    as toUserId,
       f.created_at  as createdAt,
       f.updated_at  as updatedAt,
       fu.email      AS fromUserEmail,
       fu.avatar_url AS fromUserAvatarUrl,
       fu.description AS fromUserDescription,
       fu.gender AS fromUserGender,
       tu.email      AS toUserEmail,
       tu.avatar_url AS toUserAvatarUrl,
       tu.description AS toUserDescription,
       tu.gender AS toUserGender
FROM follower f
         left join user fu on fu.id = f.from_user_id
         left join user tu on tu.id = f.to_user_id 
         WHERE f.deleted_at IS NULL LIMIT ?,?`,
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
  deleteById,
  getFollowingList,
  getFollowerList,
  getAllList,
  getUserCount,
  getInfoById,
  getConnectionList,
  getList,
}
