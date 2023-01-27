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
    let {limit, page} = req.query
    if (isEmpty(limit)) limit = 20
    if (isEmpty(page)) page = 1
    const list = await models.Tour.findAll({
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
      ]})
      console.log('------------------', data)
    return res.sendData({data})
}

router.getS('/list', list, false)
router.getS('/detail', detail, false)
module.exports = router
