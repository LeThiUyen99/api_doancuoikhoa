class Module {
  static init() {
    this.modules = {}
    this.modules.Admin = require('./Admin.js')
  }
}
Module.init()
module.exports = Module
