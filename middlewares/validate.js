const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status')
module.exports = (schema) => (req, res, next) => {
  const query = { ...req.params, ...req.query, ...req.body }
  schema.every(item => query.hasOwnProperty(item)) ? next() : next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'invalidate query'))
}
