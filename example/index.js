const WebpackBrick = require('./webpack-simple-brick')

const config = new WebpackBrick({debug:true})
  .vue()
  .babel()
  .css()
  .value()
console.log(JSON.stringify(config, null, 2))
