const path = require('path')
const fse = require('fs-extra')
const defaultPath = path.resolve('./config.json')
module.exports = function(filepath = defaultPath) {
  return function outputJson(conf) {
    fse.outputJsonSync(filepath, conf, { spaces: 2 })
  }
}
