const merge = require('./merge')
const lay = require('./lay')
const pipe = require('./pipe')
const pipeAsync = require('./pipeAsync')
const when = require('./when')
const outputJson = require('./outputJson')

module.exports = {
  lay,
  pipe,
  pipeAsync,
  when,
  if: when,
  merge,
  outputJson
}
