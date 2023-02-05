let router = require('./extensions').Router()
let models = router.models
let redispool = require('../utils/redispool')
let db = require('../utils/mysqlpool')
const {ThrowReturn} = require('./extensions')
const {getTotalPage} = require('../lib/formatData')
const {all} = require('bluebird')
const {isEmpty} = require('../lib/validate')
const {Op} = require('sequelize')

async function list(req, res) {
  let {limit, page} = req.query
  if (isEmpty(limit)) limit = 10
  if (isEmpty(page)) page = 1
  const list = await models.Blog.findAll({
    include: [{as: 'accounts', model: models.AdminCm}],
    offset: parseInt(page - 1),
    limit: parseInt(limit)
  })

  const totalPage = getTotalPage(all.length, limit)
  // throw new Error('nothing')
  return res.sendData({data: list, totalPage})
}

async function create(req, res) {
  let data = req.body
  const insert = await models.Blog.create(data)
  res.sendData(null, 'Update success!')
}

async function update(req, res) {
  const data = req.body
  await models.Blog.update(data, {where: {id: req.body.id}})

  return res.sendData(null, 'Update success!')
}

async function remove(req, res) {
  let {id} = req.params
  await models.Blog.destroy({where: {id: id}})
  return res.sendData(null, 'Remove success!')
}

async function detail(req, res) {
  const data = await models.Blog.findOne({
    where: {id: req.query.id},
    include: [{as: 'accounts', model: models.AdminCm}]
  })

  await models.Blog.update({view: +data.dataValues.view + 1}, {where: {id: req.query.id}})

  return res.sendData({data})
}

async function blog_same(req, res) {
  const {blog_id} = req.params

  let foundBlog = await models.Blog.findByPk(blog_id)
  if (isEmpty(foundBlog)) throw new ThrowReturn('Không tìm thấy Bài viết')
  foundBlog = JSON.parse(JSON.stringify(foundBlog))
  console.log(foundBlog.category_id)
  let condition = {
    id: {[Op.ne]: blog_id},
    [Op.or]: {
      auth_id: foundBlog.auth_id,
      title: {[Op.substring]: {[Op.any]: foundBlog.title.split(' ')}}
    }
  }

  const list_same = await models.Blog.findAll({where: condition, limit: 6})

  return res.sendData({list_same})
}

async function new_blog(req, res) {
  const news = await models.Blog.findAll({
    order: [['create_at', 'DESC']],
    limit: 6
  })
  return res.sendData({news})
}

router.getS('/list', list, false)
router.getS('/detail-blog', detail, false)
router.getS('/blog_same/:blog_id', blog_same, false)
router.getS('/new_blog', new_blog, false)
router.postS('/create', create, false)
router.postS('/update', update, false)
router.getS('/delete/:id', remove, false)
module.exports = router
