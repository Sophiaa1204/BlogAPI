module.exports = (req, res, next) => {
  res.success = function(data, message, code = 200) {
    return res.json({
      code,
      data,
      message,
    })
  }
  next()
}
