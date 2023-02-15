let express = require('express')
let translate = require('../utils/translation')
let logger = require('../utils/logger').log
let db = require('./../db/index')
let redispool = require('../utils/redispool')
let ThrowReturn = require('../lib/ThrowReturn')
const {isEmpty} = require('../lib/validate')
const {decodeToken} = require('../lib/token')
const {models} = require('./../db/index')

function process_exception(req, res, error) {
  let msg = error.message
  let language = error.lang || req.query.lang || req.body.lang || 'vi'

  if (typeof error === 'ThrowReturn' || error instanceof ThrowReturn) {
    res.json({
      error_code: error.code,
      error_msg: translate.T(error.message, language, ...error.args),
      data: null
    })
    logger.error(`[ERROR_CODE]: 1 - [ERROR_MESSAGE]: ${error.message}`)
    return
  }

  if (msg && msg.startsWith('Validation error:')) msg = msg.replace('Validation error:', '').trim()

  res.json({
    error_code: 500,
    error_msg: translate.T(`Có lỗi xảy ra, vui lòng thử lại sau.`, language),
    error_msg_debug: msg
  })
  logger.error(`[ERROR_CODE]: 500 - [ERROR_MESSAGE]: ${error.message}`)
}
/**
 * Common & custom reponse
 */
function sendData(data = null, message = null) {
  let response = {
    error_code: 0,
    data: data,
    error_msg: message
  }

  logger.info(
    `${this.req.baseUrl + this.req._parsedUrl?.pathname} [DATA]: ${JSON.stringify(
      data
    )}, [MESSAGE]: ${message}`
  )

  this.json(response)
}

/**
 * safety call router.get function
 * eg: router.get('abc', safety(callback))
 *
 * @param  {Function} callback    [description]
 * @param validateToken
 * @param  {Function} exception [description]
 * @return {[type]}            [description]
 */
function safety(callback, validateToken, exception = process_exception, permissions, roles) {
  if (callback.constructor.name === 'AsyncFunction') {
    return async function (req, res, ...args) {
      // Custom function
      res.sendData = sendData

      try {
        if (!validateToken) return await callback(req, res, ...args)
        // 1 decode token
        if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer')
          throw new ThrowReturn('No access token')
        const decode = decodeToken(req.headers.authorization)
        if (isEmpty(decode)) throw new ThrowReturn('Token invalid')
        // 2 check admin exist or not
        const currentAdmin = await models.AdminCm.findByPk(decode.id)
        const currentUser = await models.User.findByPk(decode.id, { raw: true })
        req.currentAdmin = currentAdmin
        req.currentUser = currentUser
        return await callback(req, res, ...args)
      } catch (error) {
        if (exception) exception(req, res, error)
      }
    }
  } else {
    return function (req, res, ...args) {
      try {
        return callback(req, res, ...args)
      } catch (error) {
        if (exception) exception(req, res, error)
      }
    }
  }
}

/**
 * override `express.Router()` function
 */
function Router(...args) {
  let router = express.Router(...args)

  //add function `getS` to call get safety
  router.getS = function (
    path,
    callback,
    validateToken = true,
    permissions = [],
    roles = [],
    exception = process_exception
  ) {
    this.get(path, safety(callback, validateToken, exception, permissions, roles))
  }
  router.postS = function (
    path,
    callback,
    validateToken = true,
    permissions = [],
    roles = [],
    exception = process_exception
  ) {
    this.post(path, safety(callback, validateToken, exception, permissions, roles))
  }
  //add db to router
  router.db = db

  router.sequelize = db.sequelize

  //add models
  router.models = db.models

  //add redis pool to router
  router.redispool = redispool

  //add logger to router
  router.logger = logger
  router.ThrowReturn = ThrowReturn

  return router
}

module.exports = {safety, Router, ThrowReturn}
