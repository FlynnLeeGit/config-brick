const _ = require('lodash')
const lay = require('./lay')
/**
 *
 * @param { boolean } condition
 * @param { array } truthy
 * @param { array } falsy
 *
 */
module.exports = (condition, truthy = [], falsy = []) =>
  function when(conf) {
    return !!condition ? lay(...truthy)(conf) : lay(...falsy)(conf)
  }
