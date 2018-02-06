const _ = require('lodash')
// https://lodash.com/docs/4.17.4#mergeWith
const concatArr = (objValue, srcValue) => {
  if (_.isArray(objValue)) {
    return _.isEqual(objValue, srcValue) ? objValue : objValue.concat(srcValue)
  }
}
const mergeBrick = (source, customizer = concatArr) => conf => {
  return _.mergeWith({}, conf, source, customizer)
}

module.exports = mergeBrick
