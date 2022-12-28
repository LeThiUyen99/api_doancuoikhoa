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
  console.log('............... path image ========= ', imagePath)
  const fileUpload = new Resize(imagePath)
  console.log(req.files)

  if (!req.files.image) {
    res.status(401).json({error: 'Please provide an image'})
  }

  const filename = await fileUpload.save(req.files.image.data, req.files.image.name)

  return res
    .status(200)
    .json({name: `${process.env.SERVER_CDN}/public/uploads/${filename}`, path: filename})
}

router.postS('/post', post, false, upload.single('image'))

module.exports = router
