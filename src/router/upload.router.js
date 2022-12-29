let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')
const upload = require('../modules/uploadMiddleware')
const Resize = require('../modules/Resize')
const path = require('path')
const fs = require('fs')

async function post(req, res) {
  // folder upload
  if (!fs.existsSync('../../public/uploads'))
    fs.mkdirSync(path.join(__dirname, '../../public/uploads'), {recursive: true})
  const imagePath = path.join(__dirname, '../../public/uploads')
  // call class Resize
  const fileUpload = new Resize(imagePath)

  if (!req.files.image) throw new ThrowReturn('Please provide an image').error_code(401)

  const filename = await fileUpload.save(req.files.image.data, req.files.image.name)

  return res.json({name: `/public/uploads/${filename}`, path: filename})
}

router.postS('/post', post, false, upload.single('image'))

module.exports = router
