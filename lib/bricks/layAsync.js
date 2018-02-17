const { isset } = require('../utils')
/**
 * lay Async Brick
 * @param { array } fns
 * @param { any } seed
 * @return {Promise<any>}
 */
const layAsync =  (fns = []) => (seed = {}) => {
  let syncCount = 0
  const final = fns.reduce((pre, fn) => {
    return pre.then(data => {
      const p = fn(data)
      if (isset(p)) {
        // async function
        if (p.then) {
          return p.then(new_data => (isset(new_data) ? new_data : data))
          // just primitive value
        } else {
          syncCount++
          return Promise.resolve(p)
        }
        // no sync returned value
      } else {
        syncCount++
        return Promise.resolve(data)
      }
    })
  }, Promise.resolve(seed))

  return final.then(result => {
    if (syncCount === fns.length) {
      console.log(
        'you are using [layAsync] but there no async brick function,may be you can use [lay] function'
      )
    }
    return result
  })
}

module.exports = layAsync
