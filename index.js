const bricks = {
  if: require('./lib/bricks/if'),
  ifAsync: require('./lib/bricks/ifAsync'),
  lay: require('./lib/bricks/lay'),
  layAsync: require('./lib/bricks/layAsync'),
  merge: require('./lib/bricks/merge')
}

function ConfigBrick(seed) {
  return new ConfigBrick.prototype.init(seed)
}

ConfigBrick.bricks = bricks

ConfigBrick.prototype.init = function(seed) {
  this.seed = seed
  return this
}

ConfigBrick.prototype.init.prototype = ConfigBrick.prototype
ConfigBrick.prototype.lay = function(...args) {
  return bricks.lay(...args)(this.seed)
}
ConfigBrick.prototype.layAsync = function(...args) {
  return bricks.layAsync(...args)(this.seed)
}
ConfigBrick.prototype.merge = function(...args) {
  return bricks.merge(...args)(this.seed)
}

ConfigBrick.extend = function() {
  const Super = this
  function Sub() {
    return new Sub.prototype.init(arguments)
  }
  function __() {
    this.constructor = Sub
  }
  Sub.prototype = ((__.prototype = Super.prototype), new __())
  Sub.prototype.init = function() {
    Super.prototype.init.apply(this, arguments)
  }
  Sub.prototype.init.prototype = Sub.prototype

  Object.setPrototypeOf(Sub, Super)
  console.log(Object.getPrototypeOf(Sub))
  return Sub
}

module.exports = ConfigBrick
