let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
// let untils = require('../utils/')
const {ThrowReturn} = require('./extensions')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const encodePassword = (password) =>
  new Promise((resolve, reject) =>
    bcrypt.hash(password, 8, function (err, hash) {
      if (err) reject(err)
      resolve(hash)
    })
  )

const comparePassword = (password, hashedPassword) =>
  new Promise((resolve) =>
    bcrypt.compare(password, hashedPassword, (err, result) => {
      console.log(result, password, hashedPassword)
      if (err) resolve(false)
      if (result) resolve(true)
      else resolve(false)
    })
  )

const generateToken = (data) =>
  jwt.sign(data, process.env.TOKEN_PRIVATE_KEY, {
    expiresIn: 60 * 60 * 24
  })

async function register(req, res) {
  let {name, username, password, phone, email} = req.body
  const newPassword = await encodePassword(password)
  const createAdmin = await models.AdminCm.findOrCreate({
    where: {user_name: username},
    defaults: {name, user_name: username, password: newPassword, phone, email}
  })
  if (!createAdmin[1]) throw new ThrowReturn('Admin existed')
  res.sendData({data: createAdmin})
}

async function login(req, res) {
  let {username, password} = Object.assign({}, req.query, req.body)

  let account = await models.AdminCm.findOne({where: {user_name: username}})
  if (!account) throw new ThrowReturn('Admin not exist')
  console.log(account)
  const isValid = await comparePassword(password, account.password)
  if (!isValid) throw new ThrowReturn('Password incorrect')

  const token = generateToken({id: account.id})
  delete account.dataValues.password

  res.send({error: 0, data: {token: token}, account})
}

async function list(req, res) {
  const admins = await models.AdminCm.findAll({})
  // throw new Error('nothing')
  res.sendData(admins)
}
router.postS('/register', register, false)
router.postS('/login', login, false)
router.getS('/list', list, false)
module.exports = router
