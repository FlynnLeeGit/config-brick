const async = require('async')

const unset = s => s === undefined || s === null

/**
 * async BrickFn process
 * @param { any } data input data
 * @param { function } fn standard brick function
 * @param { function } cb async callback
 */
const fnProcess = (data, fn, cb) => {
  // async function
  if (fn.length > 1) {
    // call next
    fn(data, new_data => {
      if (!unset(new_data)) {
        cb(null, new_data)
      } else {
        cb(null, data)
      }
    })
  } else {
    const new_data = fn(data)
    if (!unset(new_data)) {
      cb(null, new_data)
    } else {
      cb(null, data)
    }
  }
}

/**
 * make a fn -> async waterwall function
 * @param {Function} fn standard brick function
 * @param { any } initial initial input data
 */
const toAsycnFn = (fn, initial) => {
  // it's the head function of queue
  if (!unset(initial)) {
    return cb => {
      const data = initial
      // async c
      fnProcess(data, fn, cb)
    }
  } else {
    // data will be the pre function output
    return (data, cb) => {
      fnProcess(data, fn, cb)
    }
  }
}

/**
 * make a fn queue to a asyncQueue
 * so can use async.waterfall function
 *
 * @param { array } queue queue combined with fns
 * @param { any } initial initial input data
 * @return { array } async.waterwall tasks
 */
const toAsyncQueue = (queue, initial) => {
  return queue.map((fn, idx) => {
    // first no input data
    if (idx === 0) {
      return toAsycnFn(fn, initial)
    } else {
      return toAsycnFn(fn)
    }
  })
}

/**
 * use async.waterfall function
 * @param { array } queue
 * @param { * } initial
 */
const waterfallPromise = (queue, initial) => {
  return new Promise((resolve, reject) => {
    async.waterfall(toAsyncQueue(queue, initial), (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}

module.exports = {
  unset,
  waterfallPromise
}
