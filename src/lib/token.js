const jwt = require('jsonwebtoken')
const randToken = require('rand-token')
const {privateKey} = require('../../config/setting')
const redisPool = require('../utils/redispool')

const generateToken = async (data) => jwt.sign(data, privateKey, {expiresIn: '30m'})

const generateRefreshToken = async (id) => {
  const refreshToken = randToken.uid(256)
  await redisPool.setAsync(refreshToken, id, 'EX', 60 * 60)
  return refreshToken
}

const decodeToken = (token) => {
  const formatToken = token.split(' ')[1]
  return jwt.verify(formatToken, privateKey)
}

module.exports = {generateToken, decodeToken, generateRefreshToken}
