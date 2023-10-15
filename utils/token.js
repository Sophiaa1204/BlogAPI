const { sign, verify } = require('jsonwebtoken')
const tokenConfig = require('../config/config').token
module.exports = {
  sign: (payload) => {
    return sign(payload, tokenConfig.secretKey)
  },
  verify: (token) => new Promise((resolve) => {
    try {
      const decoded = verify(token, tokenConfig.secretKey)
      resolve(decoded)
    } catch (err) {
      resolve(false)
    }
  }),
}
