const { models } = require('./../db/index')

const init = (ios, socket) => {

  const join = async (data) => {
    console.log('JOIN ROOM ' + data.room)
    socket.join(data.room)
  }

  const change_room = async (data) => {
    console.log('CHANGE ROOM ' + data.old_room + " TO " + data.room)
    socket.leave(data.old_room)
    socket.join(data.room)
  }

  const send_message = async (data) => {
    console.log('SEND A MESSAGE' + data.content)
    const data_record = await models.Message.create({
      room: data.room,
      sender_id: data.sender_id,
      type: data.type,
      content: data.content,
    })
    const message = JSON.parse(JSON.stringify(data_record))
    socket.to(message.room).emit("receive_message", message)
    socket.emit("receive_message", message)
  }

  socket.onS('join', join)
  socket.onS('change_room', change_room)
  socket.onS('send_message', send_message)

}

const validate = ['token']

module.exports = { init, validate }
