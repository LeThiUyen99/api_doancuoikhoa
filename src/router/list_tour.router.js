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
  console.log('------------------', data)
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

router.getS('/list', list, false)
router.getS('/list_comment', list_comment, false)
router.getS('/category', category, false)
router.getS('/detail', detail, false)
module.exports = router
