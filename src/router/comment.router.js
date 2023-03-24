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

async function list(req, res) {
  let {limit, page} = req.query
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const list = await models.TourComment.findAll({
    include: [
      {as: 'tour', model: models.Tour},
      {as: 'user', model: models.User}
    ],
    offset: (page - 1)*limit,
    limit: limit,
  })

  const totalPage = await models.TourComment.count({
    include: [
      {as: 'tour', model: models.Tour},
      {as: 'user', model: models.User}
    ],
  });
  // throw new Error('nothing')
  return res.sendData({data: list, totalPage})
}
async function create(req, res) {
  let data = req.body
  await models.TourComment.create(data)

  res.sendData(null, 'Create success!')
}

async function update_active(req, res) {
  await models.TourBooked.update({ active_comment: req.body.active_comment }, { where: { id: req.body.id } });
  return res.sendData(null);
}

router.getS('/list', list, false)
router.postS('/create', create, false)
router.postS("/update_active", update_active, false);

module.exports = router
