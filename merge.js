const _ = require('lodash')

// https://lodash.com/docs/4.17.4#mergeWith

const concatArr = (objValue, srcValue) => {
  if (_.isArray(objValue)) {
    return _.union(objValue,srcValue)
  }
}
/**
 * merge brick
 * @param { object } source
 * @param { Function } customizer
 * @return { object }
 * @example
 * merge({a:1})({b:2}) -> {a:1,b:2}
 * merge({a:[1]})({a:[2]}) -> {a:[1,2]}
 *
 */
module.exports = (r, customizer = concatArr) =>
  function merge(l) {
    return _.mergeWith({}, l, r, customizer)
  }
