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
const twilio = require('twilio')
const client = twilio('ACd787bbe4a736acb6edf94431cf514edb', 'c4173b9d8b09f6d105661dc40e5cddfd')

async function list(req, res) {
  // let uid = req.query.uid;
  // let data = await models.V11MemberInsurrance.findOne({
  //     where : {id : uid}
  // });
  // console.log(typeof redispool.setAsync)
  // res.sendData(redispool)
  console.log(req.query)
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

  console.log(condition)

  let {limit, page} = req.query
  if (isEmpty(limit)) limit = 10
  if (isEmpty(page)) page = 1
  let list = await models.Tour.findAll({
    where: condition,
    include: [
      {as: 'tour_images', model: models.TourImage},
      {as: 'category', model: models.TourCategory},
      {as: 'country', model: models.Country},
      {as: 'city', model: models.City},
      {as: 'tour_itinerary', model: models.TourItinerary}
    ],
    // offset: parseInt(page - 1),
    // limit: parseInt(limit)
  })

  const totalPage = list.length
  let offset = (page-1)*limit;
    let end = offset + limit;
    list = list.slice(offset,end)
  console.log(list, '--------------------------page2');
  // throw new Error('nothing')
  return res.sendData({list, totalPage})
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
    status,
    price,
    currency,
    time,
    view_number,
    quantity,
    guest_number,
    city_id,
    country_id,
    category_id,
    description
  } = req.body
  const insert = await models.Tour.create({
    name,
    start_date,
    expire_date,
    images,
    thumbnail: images,
    status,
    price,
    currency,
    time,
    view_number,
    quantity,
    guest_number,
    slug: convertToSlug(name),
    city_id,
    country_id,
    category_id,
    description
  })

  const insertInti = await models.TourItinerary.create({tour_id: insert.id})

  res.sendData({data: insert})
}

async function update(req, res) {
  console.log(req.body, '-------------------------data')
  await models.Tour.update(
    {
      name: req.body.name,
      start_date: req.body.start_date,
      expire_date: req.body.expire_date,
      images: req.body.images,
      thumbnail: req.body.thumbnail,
      status: req.body.status,
      price: req.body.price,
      currency: req.body.currency,
      time: req.body.time,
      view_number: req.body.view_number,
      quantity: req.body.quantity,
      guest_number: req.body.guest_number,
      slug: req.body.slug,
      city_id: req.body.city_id,
      country_id: req.body.country_id,
      category_id: req.body.category_id,
      description: req.body.description,
      id: req.body.id
    },
    {where: {id: req.body.id}}
  )
  return res.sendData(null, 'Update success')
}

async function remove(req, res) {
  let {id} = req.params
  await models.Tour.destroy({where: {id: id}})
  return res.sendData(null, 'Remove success!')
}

async function create_img(req, res) {
  let {url, tour_id} = req.body

  await Promise.all(
    url.map((u) =>
      models.TourImage.create({
        url: u,
        tour_id
      })
    )
  )

  res.sendData(null, 'Created success')
}

const message = async (req, res) => {
  // ACd787bbe4a736acb6edf94431cf514edb
  console.log(req.query, '--------------------------------------------query')
  client.messages
    .create({
      body: `Bạn đã đặt thành công tour ${req.query.name_tour} - mã tour #${req.query.id}, tổng tiền ${req.query.price}VND. Thời gian bắt đầu từ ${req.query.start_date} đến ngày ${req.query.end_date}. Tên khách hàng ${req.query.full_name}`,
      to: '84983317052',
      messagingServiceSid: 'MG5d6b8b4bd56e1d4b35bcef693abef02e'
    })
    .then((message) => console.log(message))
    .done()
  res.sendData('Success')
}

router.getS('/list', list, false)
router.getS('/country', country, false)
router.getS('/city', city, false)
router.postS('/create', create, false)
router.postS('/create_img', create_img, false)
router.postS('/update', update, false)
router.getS('/delete/:id', remove, false)
router.getS('/message', message, false)
module.exports = router
