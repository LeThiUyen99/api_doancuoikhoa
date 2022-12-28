let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')

async function list(req, res) {
  // let uid = req.query.uid;
  // let data = await models.V11MemberInsurrance.findOne({
  //     where : {id : uid}
  // });
  // console.log(typeof redispool.setAsync)
  // res.sendData(redispool)
  let {limit, page} = req.query
  if (isEmpty(limit)) limit = 10
  if (isEmpty(page)) page = 1
  const list = await models.Tour.findAll({
    offset: parseInt(page - 1),
    limit: parseInt(limit)
  })

  const totalPgae = getTotalPage(all.length, limit)
  // throw new Error('nothing')
  return res.sendData({list, totalPgae})
}

async function country(req, res) {
  const data = await models.Country.findAll()

  return res.sendData({data})
}

async function city(req, res) {
  let {country_id} = Object.assign({}, req.query, req.body)

  console.log('-----------------------country_id', country_id)
  const data = await models.City.findAll({
    where: {
      country_id: country_id
    }
  })

  return res.sendData({data})
}

async function create(req, res) {
  let {
    name,
    start_date,
    expire_date,
    images,
    thumbnail,
    status,
    price,
    currency,
    sold_number,
    view_number,
    quantity,
    guest_number,
    slug,
    city_id,
    country_id,
    category_id
  } = req.body
  const insert = await models.Tour.create({
    name,
    start_date,
    expire_date,
    images,
    thumbnail,
    status,
    price,
    currency,
    sold_number,
    view_number,
    quantity,
    guest_number,
    slug,
    city_id,
    country_id,
    category_id
  })
  res.sendData({data: insert})
}

async function create_img(req, res) {
  let {url, tour_id} = req.body
  const insert_img = await models.TourImage.create({
    url,
    tour_id
  })
  res.sendData({data: insert_img})
}

router.getS('/list', list, false)
router.getS('/country', country, false)
router.getS('/city', city, false)
router.postS('/create', create, false)
router.postS('/create_img', create_img, false)
module.exports = router
