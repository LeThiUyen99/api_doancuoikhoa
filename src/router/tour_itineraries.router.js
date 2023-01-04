let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')
const {Op} = require('sequelize')

async function list(req, res) {
  let {limit, page} = req.query
  if (isEmpty(limit)) limit = 10
  if (isEmpty(page)) page = 1
  const list = await models.TourItinerary.findAll({
    include: [{as: 'tour', model: models.Tour}],
    offset: parseInt(page - 1),
    limit: parseInt(limit)
  })

  const totalPage = getTotalPage(all.length, limit)
  // throw new Error('nothing')
  return res.sendData({data: list, totalPage})
}

async function create(req, res) {
  let data = req.body
  const created = await models.TourItinerary.create(data)
  console.log(created, '---------------------------')

  res.sendData(null, 'Create success!')
}

async function update(req, res) {
  const data = req.body
  await models.TourItinerary.update(data, {where: {id: req.body.id}})

  return res.sendData(null, 'Update success!')
}

async function remove(req, res) {
  let {id} = req.params
  await models.TourItinerary.destroy({where: {id: id}})
  return res.sendData(null, 'Remove success!')
}

async function search_tour(req, res) {
  const tours = await models.Tour.findAll()
  return res.sendData(tours)
}

router.getS('/list', list, false)
router.getS('/search_tour', search_tour, false)
router.postS('/create', create, false)
router.postS('/update', update, false)
router.getS('/delete/:id', remove, false)
module.exports = router
