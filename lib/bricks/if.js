const lay = require('./lay')
/**
 * if Brick Function
 * @param { boolean } bool condition
 * @param { array } truthy bricks
 * @param { array } falsy 
 * @return { any }
 */
const ifBrick = (bool, truthy = [], falsy = []) => (conf = {}) => {
  return !!bool ? lay(truthy)(conf) : lay(falsy)(conf)
}
module.exports = ifBrick
