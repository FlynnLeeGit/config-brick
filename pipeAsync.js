const { _isset, _showFn, _isNext, _isPromise, _isFn } = require('./_utils')

const pipeAsync = (...fns) => conf => {
  return fns.reduce((preResolved, curr) => {
    return preResolved.then(data => {
      if (_isNext(curr)) {
        // console.log('async:next:function -> ', _showFn(curr))
        return new Promise((resolve, reject) => {
          curr(data, new_data => {
            resolve(_isset(new_data) ? new_data : data)
          })
        })
      }
      // promised brick function
      if (_isPromise(curr)) {
        // console.log('async:promise:function -> ', _showFn(curr))
        return curr.then(fn => {
          if (!_isFn(fn)) {
            console.log(
              `async:promise:function ->  ${_showFn(
                fn
              )} resolved value is not a function,so return pre data`
            )
            return data
          }
          const new_data = fn(data)
          return _isset(new_data) ? new_data : data
        })
      }
      if (_isFn(curr)) {
        // console.log('sync:function -> ', _showFn(curr))
        const new_data = curr(data)
        return Promise.resolve(_isset(new_data) ? new_data : data)
      } else {
        // console.log(`sync:value -> ${curr}, return pre data`)
        return data
      }
      return data
    })
  }, Promise.resolve(conf))
}

module.exports = pipeAsync
