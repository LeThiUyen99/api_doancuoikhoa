const moment = require('moment')

const getTotalPage = (length, limit) => {
  return Math.ceil(length / limit)
}

const convertTimeSQL = (time) => {
  return `'${moment(parseInt(time)).format('YYYY-MM-DD')}'`
}

module.exports = {getTotalPage, convertTimeSQL}
