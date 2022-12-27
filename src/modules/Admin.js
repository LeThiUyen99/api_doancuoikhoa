let logger = require('../utils/logger').log
let db = require('../utils/mysqlpool')
let models = require('../db/index')
var jwt = require('jsonwebtoken')
const {Sequelize} = require('sequelize/types')
const Op = Sequelize.Op

async function find({email, phone, username}) {
  let {modules} = require('./index')
  let account = await models.AdminCm.findOne({
    where: {
      [Op.or]: [
        {
          email
        },
        {
          phone
        },
        {
          username
        }
      ]
    },
    raw: true
  })
  return account
}

function genTokenLogin(account) {
  return jwt.sign({username: account.username, id: account.id}, Const.praviteDer, {
    algorithm: 'RS256'
  })
}
module.exports = {
  genTokenLogin,
  find
}
