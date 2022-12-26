let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')

async function test(req, res) {
  // let uid = req.query.uid;
  // let data = await models.V11MemberInsurrance.findOne({
  //     where : {id : uid}
  // });
  console.log(typeof redispool.setAsync)
  res.sendData(redispool)
}

async function test_2(req, res) {
  const admins = await models.AdminCm.findAll({})
  // throw new Error('nothing')
  res.sendData(admins)
}
router.getS('/test', test, false)
router.getS('/test_2', test_2, false)
module.exports = router
