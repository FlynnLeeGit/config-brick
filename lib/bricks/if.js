const pipeBrick = require('./pipe')
const _ = require('lodash')
const { unset } = require('../utils')
const ifBrick = (bool, truthy, falsy) => conf => {
  const condition = !!bool
  // true
  if (condition) {
    if (_.isFunction(truthy)) {
      const res = truthy(conf)
      if (unset(res)) {
        return conf
      }
      return res
    }
    if (_.isArray(truthy)) {
      return pipeBrick(truthy)(conf)
    }
    return unset(truthy) ? conf : truthy
  }
  // false
  if (!condition) {
    if (_.isFunction(falsy)) {
      const res = falsy(conf)
      if (unset(res)) {
        return conf
      }
      return res
    }
    if (_.isArray(falsy)) {
      return pipeBrick(falsy)(conf)
    }
    return unset(falsy) ? conf : falsy
  }
}

module.exports = ifBrick
