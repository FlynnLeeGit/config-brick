const { detailedDiff } = require('deep-object-diff')

const start = Date.now()
const old_conf = _.cloneDeep(this.conf)
this.conf = brickFn(...brickArgs)(this.conf)
const { detailedDiff } = require('deep-object-diff')
const diff = detailedDiff(old_conf, this.conf)
console.log(
  `\n${Ctor.themeTitle()} brick [${brickName}] layed (${Date.now() -
    start}ms)\n`,
  require('util').inspect(diff, null, null)
)
