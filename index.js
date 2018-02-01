const _ = require('lodash')
const fse = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const ifBrick = require('./bricks/if')
const pipeBrick = require('./bricks/pipe')
const mergeBrick = require('./bricks/merge')

const configBrick = function(seed) {
  return new configBrick.prototype._init(seed)
}

configBrick.prototype = {
  _init: function(seed = {}) {
    this.conf = seed

    this._debug = false
    this._name = chalk[configBrick.THEME || 'blue'](
      configBrick.NAME || '[ConfigBrick]'
    )
    return this
  },
  debug() {
    this._debug = true
    return this
  },
  /**
   * @param {* string } filename  the filename you will output json file
   * @return ConfigBrick instance
   */
  toJson(filename = path.resolve('./config.json')) {
    fse.outputJsonSync(filename, this.conf, { spaces: 2 })
    return this
  },
  value() {
    return this.conf
  }
}

configBrick.prototype._init.prototype = configBrick.fn = configBrick.prototype
configBrick.bricks = {}

/**
 * register bricks
 * @param { object } bricks
 * @return configBrick
 * @example
 *
 * const $b = require('config-brick')
 * $b.registerBrick({
 *  fn1:()=>conf=>(conf.a=1,conf)
 * })
 * it will add a prototype method name 'fn1' with wrapped
 * and add this fn to configBrick.bricks
 */
configBrick.registerBrick = bricks => {
  if (!_.isPlainObject(bricks)) {
    throw new Error(
      `${
        this._name
      } .registerBrick options should be [object] but got ${typeof bricks}`
    )
  }
  _.forEach(bricks, (brickFn, brickName) => {
    addOneBrick(brickName, brickFn)
  })
  return configBrick
}

configBrick.removeBrick = (...brickNames) => {
  _.forEach(brickNames, name => {
    configBrick.prototype[name] = null
    configBrick.bricks[name] = null
  })
}
/**
 * original brick fn to configBrick.bricks object
 * @param { string } brickName
 * @param { funciton } brickFn
 *
 */
function addOneBrick(brickName, brickFn) {
  if (!_.isFunction(brickFn)) {
    throw new Error(
      `${this._name} brick should be a [function] but got ${typeof brickFn}`
    )
  }

  configBrick.bricks[brickName] = brickFn
  configBrick.prototype[brickName] = function(...brickArgs) {
    // in debug mode
    if (this._debug) {
      const old_conf = _.cloneDeep(this.conf)
      this.conf = brickFn(...brickArgs)(this.conf)
      const { detailedDiff } = require('deep-object-diff')
      console.log(
        `\n ${this._name} laying brick -> [${brickName}]\n`,
        detailedDiff(old_conf, this.conf)
      )
      return this
    }

    this.conf = brickFn(...brickArgs)(this.conf)
    return this
  }
}

module.exports = configBrick.registerBrick({
  pipe: pipeBrick,
  if: ifBrick,
  merge: mergeBrick
})
