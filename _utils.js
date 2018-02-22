const _ = require('lodash')

const _isNext = fn => fn.length > 1
const _isPromise = fn => fn instanceof Promise
const _isFn = fn => _.isFunction(fn)
const _isAsync = fn => _isNext(fn) || _isPromise(fn)
const _isset = s => s !== undefined && s !== null
const _showFn = fn => (!!fn.name ? fn.name : fn)

module.exports = {
  _isNext,
  _isPromise,
  _isFn,
  _isAsync,
  _isset,
  _showFn
}
