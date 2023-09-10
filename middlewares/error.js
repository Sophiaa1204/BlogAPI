const httpStatus = require('http-status')
const logger = require('../config/logger')
const ApiError = require('../utils/ApiError')

const errorConverter = (err, req, res, next) => {
  let error = err
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR
    const message = error.message || httpStatus[statusCode]
    error = new ApiError(statusCode, message, false, err.stack)
  }

  next(error)
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err
  if (!err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
  }


  const response = {
    code: statusCode,
    message,
    stack: err.stack,
  }

  logger.error(err)

  res.json(response)
}

module.exports = {
  errorConverter,
  errorHandler,
}
