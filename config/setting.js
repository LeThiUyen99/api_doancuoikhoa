require('dotenv').config()

module.exports.server = {
  port: process.env.SERVER_PORT,
  hostname: process.env.SERVER_HOSTNAME,
  host_cdn: process.env.SERVER_CDN
}

let mysql = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  timezone: '+07:00',
  decimalNumbers: true,
  connectionLimit: 5,
  multipleStatements: true,
  database: process.env.DB_NAME
}
module.exports.redis = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  options: {},
  maxConnections: 5,
  handleRedisError: true
}

module.exports.mysql = mysql
module.exports.sequelize = {
  database: mysql.database,
  username: mysql.user,
  password: mysql.password,
  options: {
    host: mysql.host,
    port: mysql.port,
    dialect: 'mysql',
    dialectOptions: {
      decimalNumbers: true
    },
    operatorsAliases: false,
    timezone: mysql.timezone,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}
module.exports.logger4js = {
  appenders: {
    out: {type: 'stdout'},
    result: {
      type: 'dateFile',
      filename: 'logs/result/result_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true
    },
    'result-filter': {
      type: 'logLevelFilter',
      appender: 'result',
      level: 'info',
      maxLevel: 'info'
    },
    error: {
      type: 'dateFile',
      filename: 'logs/error/error_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true
    },
    'error-filter': {
      type: 'logLevelFilter',
      appender: 'error',
      level: 'error',
      maxLevel: 'error'
    },
    default: {
      type: 'dateFile',
      filename: 'logs/default/default_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true
    }
  },
  categories: {
    default: {appenders: ['out', 'default', 'result-filter', 'error-filter'], level: 'trace'},
    result: {appenders: ['result', 'result-filter'], level: 'info'},
    error: {appenders: ['error', 'error-filter'], level: 'error'}
  }
}

module.exports.privateKey = process.env.TOKEN_PRIVATE_KEY
