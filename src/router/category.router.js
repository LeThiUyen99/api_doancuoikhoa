let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')
const {NOW} = require('sequelize')
const {Op} = require('sequelize')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')

async function create(req, res) {
  let {name} = req.body
  const insert = await models.TourCategory.create({
    name: name
  })
  res.sendData({data: insert})
}

async function list(req, res) {
  let {limit, page} = req.query
  if (isEmpty(limit)) limit = 10
  if (isEmpty(page)) page = 1
  const list = await models.TourCategory.findAll({
    offset: parseInt(page - 1),
    limit: parseInt(limit)
  })

  const totalPgae = getTotalPage(all.length, limit)
  // throw new Error('nothing')
  return res.sendData({list, totalPgae})
}
router.postS('/create', create, false)
router.getS('/list', list, false)
module.exports = router
