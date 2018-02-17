const _ = require('lodash')
const fse = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const { isset, waterfallPromise } = require('./lib/utils')

const ifBrick = require('./lib/bricks/if')
const pipeBrick = require('./lib/bricks/pipe')
const mergeBrick = require('./lib/bricks/merge')
const scriptBrick = require('./lib/bricks/script')

const ConfigBrick = function(seed) {
  return new ConfigBrick.prototype.init(seed)
}

ConfigBrick.Name = chalk.blue('[ConfigBrick]')

ConfigBrick.prototype = {
  init: function(conf = {}) {
    this.conf = conf
    this.queue = []
    this._debug = false
    this._async = false
    this._file = {
      json: null
    }
    return this
  },
  /**
   * @param {* string } filename  the filename you will output json file
   * @return ConfigBrick instance
   */
  toJson(filename = path.resolve('./config.json')) {
    this._file.json = filename
    return this
  },
  _outputJsonSync(conf) {
    if (this._file.json) {
      fse.outputJsonSync(this._file.json, conf, { spaces: 2 })
    }
  },
  debug() {
    this._debug = true
    return this
  },
  done() {
    return this.value()
  },
  value() {
    if (this._async) {
      return waterfallPromise(this.queue, this.conf).then(conf => {
        this._outputJsonSync(conf)
        return conf
      })
    }
    const conf = pipeBrick(this.queue)(this.conf)
    this._outputJsonSync(conf)
    return conf
  }
}

ConfigBrick.prototype.init.prototype = ConfigBrick.prototype
ConfigBrick.bricks = {}
ConfigBrick.state = {}

/**
 * register bricks
 * @param { object } bricks
 * @return ConfigBrick
 * @example
 *
 * const $b = require('config-brick')
 * $b.registerBrick({
 *  fn1:()=>conf=>(conf.a=1,conf)
 * })
 * // or
 * $b.use({
 *  fn1:()=>conf=>(conf.a =1,conf)
 * })
 * it will add a prototype method name 'fn1' with wrapped
 * and add this fn to ConfigBrick.bricks
 */
ConfigBrick.registerBrick = ConfigBrick.use = function(bricks) {
  const Ctor = this
  if (!_.isPlainObject(bricks)) {
    throw new Error(
      `${
        Ctor.Name
      } .registerBrick options should be [object] but got ${typeof bricks}`
    )
  }

  _.forEach(bricks, (brickFn, brickName) => {
    addOneBrick(Ctor, brickName, brickFn)
  })
  return Ctor
}

/**
 * original brick fn to ConfigBrick.bricks object
 * @param { string } brickName
 * @param { funciton } brickFn
 *
 */
function addOneBrick(Ctor, brickName, brickFn) {
  if (!_.isFunction(brickFn)) {
    throw new Error(
      `${
        Ctor.Name
      } brick [${brickName}] should be a [function] but got ${typeof brickFn}`
    )
  }

  Ctor.bricks[brickName] = brickFn
  Ctor.prototype[brickName] = function(...brickArgs) {
    const fn = brickFn(...brickArgs)
    if (fn.length > 1 && !this._async) {
      this._async = true
      console.log(
        `${
          Ctor.Name
        } brick [${brickName}] is a async brick function, .value() now will be a Promise`
      )
    }
    this.queue.push(fn)
    return this
  }
}

ConfigBrick.extend = function() {
  const Super = this
  function Sub(...args) {
    return new Sub.prototype.init(...args)
  }
  Sub.state = {}
  // extends Sub.__proto__ = Super
  Object.setPrototypeOf(Sub, Super)
  function __() {
    this.constructor = Sub
  }
  Sub.prototype = ((__.prototype = Super.prototype), new __())
  Sub.prototype.init = function(...args) {
    Super.prototype.init.apply(this, args)
  }
  Sub.prototype.init.prototype = Sub.prototype

  return Sub
}

module.exports = ConfigBrick.registerBrick({
  pipe: pipeBrick,
  if: ifBrick,
  merge: mergeBrick,
  script: scriptBrick
})
