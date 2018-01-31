const { ConfigBrick, merge } = require('../index')

class WebpackBrick extends ConfigBrick {
  constructor(props) {
    super(props)
  }
}

const plugins = opts => conf => {
  return merge(conf, {
    plugins: [...opts]
  })
}

const loaders = opts => conf => {
  return merge(conf, {
    module: {
      rules: [...opts]
    }
  })
}

const vue = opts => conf => {
  return loaders([{ test: /\.vue$/, loader: 'vue-loader' }])(conf)
}

const babel = opts => conf => {
  return loaders([{ test: /\.js$/, loader: 'babel-loader' }])(conf)
}

const css = opts => conf => {
  return loaders([{ test: /\.css$/, loader: 'style-loader!css-loader' }])(conf)
}

WebpackBrick.use(plugins, loaders, vue, babel, css)
module.exports = WebpackBrick
