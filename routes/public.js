const multer = require('multer')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + `.${file.originalname.split('.').pop()}`)
  },
})

const upload = multer({ storage: storage })

const express = require('express')
const router = express.Router()

router.post('/upload', upload.single('file'), function(req, res) {
  res.success(req.file.path.replace('public', ''))
})

router.post('/encrypt', (req, res) => {
  res.success(require('../utils/crypto').encryptByPublicKey(req.body.data))
})

module.exports = router
