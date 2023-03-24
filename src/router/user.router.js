let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
// let untils = require('../utils/')
const {ThrowReturn} = require('./extensions')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')

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
  const createAdmin = await models.User.findOrCreate({
    where: {username: username},
    defaults: {name, username: username, password: newPassword, phone, email}
  })
  if (!createAdmin[1]) throw new ThrowReturn('Admin existed')
  res.sendData({data: createAdmin})
}

async function login(req, res) {
  let {username, password} = Object.assign({}, req.query, req.body)

  let account = await models.User.findOne({where: {username: username}})
  if (!account) throw new ThrowReturn('Admin not exist')
  console.log(account)
  if (account.is_active === 0)
    throw new ThrowReturn('Tài khoản chưa được kích hoạt. Vui lòng liên hệ với admin!')
  const isValid = await comparePassword(password, account.password)
  if (!isValid) throw new ThrowReturn('Password incorrect')

  const token = generateToken({id: account.id})
  delete account.dataValues.password

  res.sendData({token, account})
}

async function list(req, res) {
  let {limit, page} = req.query
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const admins = await models.User.findAll({
    offset: (page - 1)*limit,
    limit: limit,
  })
  const totalPgae = await models.User.count();
  // throw new Error('nothing')
  res.sendData({admins, totalPgae})
}

async function update(req, res) {
  const data = req.body
  await models.User.update(data, {where: {id: req.body.id}})

  return res.sendData(null, 'Update success!')
}

async function remove(req, res) {
  let {id} = req.params
  await models.User.destroy({where: {id: id}})
  return res.sendData(null, 'Remove success!')
}

router.postS('/register', register, false)
router.postS('/login', login, false)
router.postS('/update', update, false)
router.getS('/list', list, false)
router.getS('/delete/:id', remove, false)
module.exports = router
