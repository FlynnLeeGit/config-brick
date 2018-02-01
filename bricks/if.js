const pipeBrick = require('./pipe')
const ifBrick = (bool, truthyBricksFn, falsyBricksFn) => conf => {
  conf = !!bool
    ? pipeBrick(truthyBricksFn)(conf)
    : pipeBrick(falsyBricksFn)(conf)
  return conf
}

module.exports = ifBrick