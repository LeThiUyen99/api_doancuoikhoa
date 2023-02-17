const fs = require('fs')
let path = require('path')
const { Server } = require('socket.io')
const ThrowReturn = require('./ThrowReturn')
const {models} = require('./../db/index')
const { logger } = require('../utils/logger')
const { isEmpty } = require('./validate')
const { decodeTokenSocket } = require('./token')

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

  ; (function SocketIO() {
    let ios = {}
    const ioFiles = path.join(__dirname, '../socket')
    fs.readdirSync(ioFiles)
      .filter((name) => name.toLowerCase().endsWith('.socket.js'))
      .map((name) => name.replace('.js', ''))
      .forEach((name) => {
        const ioName = name === 'index.socket' ? '' : `/${name.replace('.socket', '')}`
        const ioConnect = io.of(ioName)
        ios = { ...ios, [name.replace('.socket', '')]: ioConnect }
      })

    Object.keys(ios).forEach((key) => {
      const ioPath = `../socket/${key}.socket`
      const ioModule = require(ioPath)
      ios[key]
        .use(async (socket, next) => {
          try {
            // **************************************************************
            // *                   1. Validate Token                        *
            // **************************************************************
            if (ioModule.validate.includes('token')) {
              const decode = decodeTokenSocket(socket?.handshake?.auth?.token || socket?.handshake?.query?.token)

              const currentAdmin = await models.AdminCm.findByPk(decode.id, { raw: true })
              const currentUser = await models.User.findByPk(decode.id, { raw: true })

              socket.admin = currentAdmin
              socket.user = currentUser
            }
            next()
          } catch (error) {
            next(new ThrowReturn(error.message))
          }
        })
        .on('connection', (socket, ...arg) => {
          socket.onS = function (event, callback) {
            this.on(event, safety(callback, socket))
          }
          return ioModule.init(ios, socket, ...arg)
        })
    })

    return ios
  })()

const safety = (callback, socket) => {
  if (callback.constructor.name === 'AsyncFunction') {
    return async function (data, ...arg) {
      try {
        return await callback(data, ...arg)
      } catch (error) {
        exception(socket, error)
      }
    }
  } else {
    return function (socket, ...arg) {
      try {
        return callback(socket, ...arg)
      } catch (error) {
        exception(socket, error)
      }
    }
  }
}

function exception(socket, error) {
  logger.error(error)
  logger.error(`[SOCKET ERROR] [${error.code}] ${JSON.stringify(error.message)}\n`)
  return socket.emit("error", { message: error.message, error_code: error.code })
}

module.exports = io
