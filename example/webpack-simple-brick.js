// brick can be found in $b.bricks
const { merge, lay } = require('../index')

const plugins = (plugins = []) => conf => {
  return merge({
    plugins: [...plugins]
  })(conf)
}
const rules = (rules = []) => conf => {
  return merge({
    module: {
      rules: [...rules]
    }
  })(conf)
}

const vue = () => conf => {
  return rules([{ test: /\.vue$/, loader: 'vue-loader' }])(conf)
}
const babel = () => conf => {
  return rules([{ test: /\.js$/, loader: 'babel-loader' }])(conf)
}
const css = () => conf => {
  return rules([{ test: /\.css$/, loader: 'style-loader!css-loader' }])(conf)
}

const conf = lay(
  vue(), //
  babel(),
  css()
)()

console.log(conf)


