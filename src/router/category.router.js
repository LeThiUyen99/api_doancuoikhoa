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
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const list = await models.TourCategory.findAll({
    offset: (page - 1)*limit,
    limit: limit
  })

  const totalPage = await models.TourCategory.count();
  // throw new Error('nothing')
  return res.sendData({list, totalPage})
}


async function update(req, res) {
  const data = req.body
  await models.TourCategory.update(data, {where: {id: req.body.id}})

  return res.sendData(null, 'Update success!')
}

async function remove(req, res) {
  let {id} = req.params
  await models.TourCategory.destroy({where: {id: id}})
  return res.sendData(null, 'Remove success!')
}

router.postS('/create', create, false)
router.postS('/update', update, false)
router.getS('/list', list, false)
router.getS('/delete/:id', remove, false)
module.exports = router
