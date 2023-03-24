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
    const list = await models.User.findAll({
      offset: (page - 1)*limit,
      limit: limit
    })
  
    const total = await models.User.count();
    // throw new Error('nothing')
    return res.sendData({list, total})
  }


router.getS('/list', list, false)
module.exports = router