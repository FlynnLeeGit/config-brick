const layAsync = require('./layAsync')

/**
 * if Async Brick Function
 * @param { boolean } bool condition
 * @param { array } truthy bricks
 * @param { array } falsy
 * @return { Promise<any> }
 */
const ifAsync = (bool, truthy = [], falsy = []) => (conf = {}) => {
  return !!bool ? layAsync(truthy)(conf) : layAsync(falsy)(conf)
}

module.exports = ifAsync
