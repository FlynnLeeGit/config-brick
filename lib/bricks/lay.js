const { isset } = require('../utils')
/**
 * lay brick
 * @param {array} fns
 * @param {any} seed
 * @return {any}
 */
const lay = (fns = []) => (seed = {}) => {
  if (!Array.isArray(fns)) {
    throw new Error('brick [lay] should take array options but got', typeof fns)
  }
  return fns.reduce((data, fn) => {
    const new_data = fn(data)
    if (isset(new_data)) {
      if (new_data.then) {
        throw new Error(
          `you are using [lay] function but with async brick function [${
            fn.name
          }],perhaps should use [layAsync] instead`
        )
      } else {
        return new_data
      }
    } else {
      return data
    }
  }, seed)
}

module.exports = lay
