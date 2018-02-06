/**
 *  just excute script
 * @param { Function } fn function script you want to excute
 */

const scriptBrick = fn => conf => {
  if (typeof fn !== 'function') {
    throw new Error('brick [script] options must be a function')
  }
  fn()
  return conf
}

module.exports = scriptBrick
