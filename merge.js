const _ = require('lodash')

// https://lodash.com/docs/4.17.4#mergeWith
const concatArr = (objValue, srcValue) => {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

function merge(object, source, customizer = concatArr) {
  return _.mergeWith({}, object, source, customizer)
}

module.exports = merge