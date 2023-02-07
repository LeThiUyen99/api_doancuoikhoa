let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
const {ThrowReturn} = require('./extensions')
const {Sequelize} = require('sequelize')
const {default: collect} = require('collect.js')
const moment = require('moment')

async function chart(req, res) {
  let {rows, count} = await models.TourBooked.findAndCountAll({
    where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('created_at')), moment().year())
  })

  rows = JSON.parse(JSON.stringify(rows))
  rows = rows.map((r) => ({...r, month: moment(r.created_at).month() + 1}))
  //   console.log(JSON.parse(JSON.stringify(collect(rows).groupBy('month').keys().map)))
  const incomeByMonth = [
    {id: 1, month: 'tháng 1', money: collect(rows).where('month', 1).sum('price')},
    {id: 2, month: 'tháng 2', money: collect(rows).where('month', 2).sum('price')},
    {id: 3, month: 'tháng 3', money: collect(rows).where('month', 3).sum('price')},
    {id: 4, month: 'tháng 4', money: collect(rows).where('month', 4).sum('price')},
    {id: 5, month: 'tháng 5', money: collect(rows).where('month', 5).sum('price')},
    {id: 6, month: 'tháng 6', money: collect(rows).where('month', 6).sum('price')},
    {id: 7, month: 'tháng 7', money: collect(rows).where('month', 7).sum('price')},
    {id: 8, month: 'tháng 8', money: collect(rows).where('month', 8).sum('price')},
    {id: 9, month: ' tháng 9', money: collect(rows).where('month', 9).sum('price')},
    {id: 10, month: 'tháng 10', money: collect(rows).where('month', 10).sum('price')},
    {id: 11, month: 'tháng 11', money: collect(rows).where('month', 11).sum('price')},
    {id: 12, month: 'tháng 12', money: collect(rows).where('month', 12).sum('price')}
  ]

  collect(rows).sum('price')

  const income = collect(rows).sum('price')

  const cancel = collect(rows).where('active', 2).count()
  const success = collect(rows).where('active', 1).count()

  const view = await models.Tour.findAll({
    attributes: ['name', 'id', 'view_number'],
    order: [['view_number', 'DESC']]
  })

  res.sendData({income, count, view, cancel, incomeByMonth, success})
}

router.getS('/chart', chart, false)
module.exports = router
