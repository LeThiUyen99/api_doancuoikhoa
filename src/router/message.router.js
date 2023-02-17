let router = require('./extensions').Router()
let models = router.models


async function list(req, res) {
  const { room } = req.query
  const page = +req.query.page || 1
  const limit = +req.query.limit || 10

  const { rows, count } = await models.Message.findAndCountAll({
    where: { room },
    offset: (page - 1) * limit,
    limit: limit,
    order: [["created_at", "ASC"]]
  })

  let isLast = false
  if ((page * limit) >= count) isLast = true

  return res.sendData({ list: rows, isLast })
}

async function rooms(req, res) {
  const rooms = await models.Message.findAll({
    include: [{ model: models.User, as: "user"}],
    })

    let unique = []

    const list = JSON.parse(JSON.stringify(rooms)).filter((v) => {
      if (!unique.includes(v.room)) {
        unique = [...unique, v.room]
        return v
      }
    }).map((v) => ({
      roomId: v.user.id,
      roomName: v.user.name,
      avatar: 'https://66.media.tumblr.com/avatar_c6a8eae4303e_512.pnj',
      users: []
    }))

    return res.sendData({list})
  }

router.getS('/list', list, true)
router.getS('/rooms', rooms, true)

module.exports = router