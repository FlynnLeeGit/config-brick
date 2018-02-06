const _ = require('lodash')
const fse = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const { unset, waterfallPromise } = require('./lib/utils')

const ifBrick = require('./lib/bricks/if')
const pipeBrick = require('./lib/bricks/pipe')
const mergeBrick = require('./lib/bricks/merge')
const scriptBrick = require('./lib/bricks/script')

const ConfigBrick = function(seed) {
  return new ConfigBrick.prototype.init(seed)
}

ConfigBrick.config = {
  title: '[ConfigBrick]',
  theme: 'blue'
}

ConfigBrick.themeTitle = function() {
  return chalk[this.config.theme](this.config.title)
}

ConfigBrick.prototype = {
  init: function(conf = {}) {
    this.conf = conf
    this.queue = []
    this._debug = false
    this._async = false
    return this
  },
  /**
   * @param {* string } filename  the filename you will output json file
   * @return ConfigBrick instance
   */
  // toJson(filename = path.resolve('./config.json')) {
  //   if (this._async) {
  //     this.value().then(res => {
  //       fse.outputJsonSync(filename, res, { spaces: 2 })
  //     })
  //   } else {
  //     fse.outputJsonSync(filename, this.value(), { spaces: 2 })
  //   }
  //   return this
  // },
  debug() {
    this._debug = true
    return this
  },
  value() {
    if (this._async) {
      return waterfallPromise(this.queue, this.conf).then(conf => {
        return conf
      })
    }
    return pipeBrick(this.queue)(this.conf)
  }
}

ConfigBrick.prototype.init.prototype = ConfigBrick.prototype
ConfigBrick.bricks = {}

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
      `${Ctor.themeTitle()} .registerBrick options should be [object] but got ${typeof bricks}`
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
      `${Ctor.themeTitle()} brick [${brickName}] should be a [function] but got ${typeof brickFn}`
    )
  }

  Ctor.bricks[brickName] = brickFn
  Ctor.prototype[brickName] = function(...brickArgs) {
    const fn = brickFn(...brickArgs)
    if (fn.length > 1 && !this._async) {
      this._async = true
      console.log(
        `${Ctor.themeTitle()} brick [${brickName}] is a async brick function, .value() now will a Promise instance`
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
  Sub.prototype.init = function(seed = {}) {
    this.conf = seed
    this.queue = []
    this._async = false
    this._debug = false
    this._result = null
    return this
  }

  // es2015 extends
  Object.setPrototypeOf(Sub, Super)
  Object.setPrototypeOf(Sub.prototype, Super.prototype)

  Sub.config = Object.assign({}, Super.config)

  Sub.prototype.init.prototype = Sub.prototype
  return Sub
}

module.exports = ConfigBrick.registerBrick({
  pipe: pipeBrick,
  if: ifBrick,
  merge: mergeBrick,
  script: scriptBrick
})
