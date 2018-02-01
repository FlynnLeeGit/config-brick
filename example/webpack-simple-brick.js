// first predefined some bricks you want
const $b = require('../index')
// brick can be found in $b.bricks
const { merge } = $b.bricks

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


const webpackBrick = $b.registerBrick({
  plugins,
  rules,
  vue,
  babel,
  css
})

module.exports = webpackBrick