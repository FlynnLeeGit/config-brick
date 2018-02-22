const { _showFn, _isAsync } = require('./_utils')
const pipe = require('./pipe')
const pipeAsync = require('./pipeAsync')
const _ = require('lodash')

const lay = (...bricks) => (conf = {}) => {
  const asyncBricks = _.filter(bricks, _isAsync)
  if (!asyncBricks.length) {
    return pipe(...bricks)(conf)
  } else {
    console.log(
      `detect async function,final result will be a Promise`
    )
    return new Promise((resolve, reject) => {
      resolve(pipeAsync(...bricks)(conf))
    })
  }
}

module.exports = lay
