const _ = require('lodash')
const fse = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const NAME = chalk.blue('[ConfigBrick]')

const validate = {
  fn(fn, tag) {
    if (!_.isFunction(fn)) {
      throw new Error(`${NAME} '${tag}' should be a function`)
    }
  }
}

function ConfigBrick(userOptions = {}) {
  const defaultOptions = {
    seed: {},
    debug: false
  }
  const options = _.merge({}, defaultOptions, userOptions)
  this.config = options.seed
  this.debug = options.debug
}

ConfigBrick.prototype = {
  /**
   * get the config final value
   */
  value() {
    return this.config
  },
  /**
   * @param {* string } filename  the filename you will output json file
   * @return ConfigBrick instance
   */
  toJson(filename = path.resolve('./config.json')) {
    fse.outputJsonSync(filename, this.config, { spaces: 2 })
    return this
  }
}

/**
 * add bricks in ConfigBrick prototype
 * @param { object | array | fn } bricks
 * @return ConfigBrick instance
 * @example
 *
 * ConfigBrick.use({fn1:fn1,fn2:fn2})
 * ConfigBrick.use([fn1,fn2,fn3])
 * ConfigBrick.use(fn1,fn2)
 *
 */
ConfigBrick.use = function(first, ...rest) {
  if (_.isPlainObject(first)) {
    _.forEach(first, (brickFn, brickName) => {
      validate.fn(brickFn, brickFn)
      addBrick(brickName, brickFn)
    })
    return
  }
  if (_.isArray(first)) {
    _.forEach(first, brickFn => {
      validate.fn(brickFn, brickFn)
      const brickName = brickFn.name
      addBrick(brickName, brickFn)
    })
    return
  }
  // more than one argument
  if (_.isFunction(first)) {
    const bricks = [first, ...rest]
    _.forEach(bricks, brickFn => {
      validate.fn(brickFn, brickFn)
      const brickName = brickFn.name
      addBrick(brickName, brickFn)
    })
    return
  }
  throw new Error(
    `${NAME} .use options should be any of [object,array,function] but got ${typeof first}`
  )
}

function addBrick(brickName, brickFn) {
  ConfigBrick.prototype[brickName] = function(brickOpts) {
    if (this.debug) {
      const old_config = _.cloneDeep(this.config)
      this.config = brickFn(brickOpts)(this.config)
      const { detailedDiff } = require('deep-object-diff')
      console.log(
        `\n ${NAME} add brick [${brickName}]\n ->`,
        detailedDiff(old_config, this.config)
      )
      return this
    } else {
      this.config = brickFn(brickOpts)(this.config)
      // for chain use
      return this
    }
  }
}

module.exports = ConfigBrick