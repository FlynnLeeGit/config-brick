const { _isset, _showFn, _isFn, _isAsync } = require('./_utils')

const pipe = (...fns) => (conf = {}) => {
  return fns.reduce((data, curr) => {
    if (_isAsync(curr)) {
      throw new Error(
        `${_showFn(
          curr
        )} is a async function,maybe you can use [pipeAsync] instead`
      )
    }
    if (_isFn(curr)) {
      // console.log('sync:function -> ', _showFn(curr))
      const new_data = curr(data)
      return _isset(new_data) ? new_data : data
    } else {
      // console.log(`sync:value -> ${curr}, return pre data`)
      return data
    }
  }, conf)
}
module.exports = pipe
