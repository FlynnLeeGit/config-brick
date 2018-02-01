const $wsb = require('./webpack-simple-brick')

const conf = $wsb()
  .vue()
  .babel()
  .css()
  .value()
console.log(JSON.stringify(conf, null, 2))
