let router = require('./extensions').Router()
let models = router.models


async function list(req, res) {
  const {room} = req.query
    const list = await models.Message.findAll({ where: {room}})
    return res.sendData({list})
  }

  async function rooms(req, res) {
    const rooms = await models.Message.findAll({
      include: [{model: models.User, as: "user"}],
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