const { unset } = require('../utils')


/**
 * pipe brick function from left to right
 * @param { array } fns 
 */
const pipeBrick = (fns) => conf => {
  if (!Array.isArray(fns)) {
    fns = []
  }
  return fns.reduce((conf, fn) => {
    // handler
    const res = fn(conf)
    if (unset(res)) {
      return conf
    }
    return res
  }, conf)
}

module.exports = pipeBrick
