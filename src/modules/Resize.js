// Resize.js

const {uuid} = require('uuidv4')
const path = require('path')
const fs = require('fs')

function utf8toAnsi(text) {
  if (text === null || text === undefined) return text

  text = text.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự/g, 'u')
  text = text.replace(/á|à|ả|ã|ạ|ă|ắ|ặ|ằ|ẳ|ẵ|â|ấ|ầ|ẩ|ẫ|ậ|Á|À|Ả|Ã|Ạ|Ă|Ắ|Ặ|Ằ|Ẳ|Ẵ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ/g, 'a')
  text = text.replace(/đ|Đ/g, 'd')
  text = text.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ/g, 'e')
  text = text.replace(/í|ì|ỉ|ĩ|ị|Í|Ì|Ỉ|Ĩ|Ị/g, 'i')
  text = text.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ/g, 'o')
  text = text.replace(/ý|ỳ|ỷ|ỹ|ỵ|Ý|Ỳ|Ỷ|Ỹ|Ỵ/g, 'y')
  return text
}

class Resize {
  constructor(folder) {
    this.folder = folder
  }
  async save(buffer, file_name) {
    const filename = Resize.filename(file_name)
    const filepath = this.filepath(filename)
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, buffer, function (err) {
        if (err) {
          console.log('save file error ', err)
          return console.log(err)
        }
        resolve(filename)
      })
    })
  }
  static filename(file_name) {
    // random file name
    let x = file_name.split('.')
    let file_type = 'bin'
    if (x.length > 0) {
      let _file_type = x[x.length - 1]
      if (_file_type == utf8toAnsi(_file_type)) file_type = _file_type
    }
    return `${uuid()}.${file_type}`
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`)
  }
}
module.exports = Resize
