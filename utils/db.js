const mysql = require('mysql2/promise')
const connect = () => mysql.createConnection(require('../config/config').db)
module.exports = (sql, values) => new Promise(async(resolve, reject) => {
  const db = await connect()
  const data = await db.query(sql, values)
  db.destroy()
  resolve(data)
})
