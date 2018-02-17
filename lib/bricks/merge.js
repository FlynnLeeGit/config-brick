const _ = require('lodash')
// https://lodash.com/docs/4.17.4#mergeWith

const concatArr = (objValue, srcValue) => {
  if (_.isArray(objValue)) {
    return _.isEqual(objValue, srcValue) ? objValue : objValue.concat(srcValue)
  }
}
/**
 * merge brick
 * @param { object } source
 * @param { Function } customizer
 * @return { object }
 */
const merge = (source, customizer = concatArr) => (conf = {}) => {
  return _.mergeWith({}, conf, source, customizer)
}

module.exports = merge
