var express = require('express')
var path = require('path')
const helmet = require('helmet')
const morgan = require('./config/morgan')
const ApiError = require('./utils/ApiError')
const { errorConverter, errorHandler } = require('./middlewares/error')
const compression = require('compression')
const cors = require('cors')
const httpStatus = require('http-status')
var app = express()
app.use(morgan.successHandler)
app.use(morgan.errorHandler)
app.use(helmet({
  crossOriginResourcePolicy: false,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// gzip compression
app.use(compression())
// enable cors
app.use(require('./middlewares/ApiSuccess'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.use('/v1', require('./routes/index'))
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)
module.exports = app
