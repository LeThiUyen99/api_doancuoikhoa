let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')
const {Op} = require('sequelize')
const {convertToSlug} = require('../utils/hepper')
const req = require('express/lib/request')
const res = require('express/lib/response')
const { sequelize } = require('../db')

async function list(req, res) {
  let condition = {}

  switch (req.query.filter) {
    case '1':
      condition.id = req.query.q
      break
    case '2':
      condition.name = {[Op.substring]: req.query.q}
      break
  }

  if (req.query.category_id) condition.category_id = req.query.category_id
  if (req.query.country_id) condition.country_id = req.query.country_id
  if (req.query.city_id) condition.city_id = req.query.city_id
  if (req.query.price) condition.price = req.query.price
  if (req.query.start_date) condition.start_date = req.query.start_date
  if (req.query.expire_date) condition.expire_date = req.query.expire_date
  let {limit, page} = req.query
  if (isEmpty(limit)) limit = 20
  if (isEmpty(page)) page = 1
  const list = await models.Tour.findAll({
    where: condition,
    include: [
      {as: 'tour_images', model: models.TourImage},
      {as: 'category', model: models.TourCategory},
      {as: 'country', model: models.Country},
      {as: 'city', model: models.City},
      {as: 'tour_itinerary', model: models.TourItinerary}
    ],
    offset: parseInt(page - 1),
    limit: parseInt(limit)
  })

  const total = getTotalPage(all.length, limit)
  // throw new Error('nothing')
  return res.sendData({list, total})
}

async function detail(req, res) {
  const data = await models.Tour.findOne({
    where: {id: req.query.id},
    include: [
      {as: 'tour_images', model: models.TourImage},
      {as: 'category', model: models.TourCategory},
      {as: 'country', model: models.Country},
      {as: 'city', model: models.City},
      {as: 'tour_itinerary', model: models.TourItinerary}
    ]
  })

  await models.Tour.update({view_number: +data.dataValues.view_number + 1}, {where: {id: req.query.id}})

  return res.sendData({data})
}

async function category(req, res) {
  const cate = await models.TourCategory.findAll({
    where: {active: req.query.cate_id}
  })
  return res.sendData({cate})
}
async function list_comment(req, res) {
  console.log(req.query.tour_id, '------req.query.tour_id')
  const comment = await models.TourComment.findAll({
    where: [{user_id: req.query.user_id}, {tour_id: req.query.tour_id}],
    include: [
      {as: 'tour', model: models.Tour},
      {as: 'user', model: models.User}
    ]
  })

  return res.sendData({comment})
}

async function tour_same(req, res) {
  const {tour_id} = req.params

  let foundTour = await models.Tour.findByPk(tour_id)
  if (isEmpty(foundTour)) throw new ThrowReturn('Không tìm thấy tour')
  foundTour = JSON.parse(JSON.stringify(foundTour))
  console.log(foundTour.category_id)
  let condition = {
    id: {[Op.ne]: tour_id},
    [Op.or]: {
      country_id: foundTour.country_id,
      category_id: foundTour.category_id,
      city_id: foundTour.city_id,
      start_date: foundTour.start_date
      // name: {[Op.substring]: {[Op.any]: foundTour.name.split(' ')}}
    }
  }

  const list_same = await models.Tour.findAll({where: condition, limit: 6})

  return res.sendData({list_same})
}

async function tour_hot(req, res) {
  const hot = await models.Tour.findAll({
    order: [['sold_number', 'DESC']],
    limit: 6       
  })
  return res.sendData({hot})
}

router.getS('/list', list, false)
router.getS('/tour_same/:tour_id', tour_same, false)
router.getS('/list_comment', list_comment, false)
router.getS('/category', category, false)
router.getS('/detail', detail, false)
router.getS('/tour_hot', tour_hot, false)
module.exports = router
