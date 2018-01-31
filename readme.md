## config-brick

[![CircleCI](https://circleci.com/gh/FlynnLeeGit/config-brick.svg?style=svg)](https://circleci.com/gh/FlynnLeeGit/config-brick)

simple config builder for some complex config file like webpack, it can be the base config builder,and you can add custom brick function

### install

```shell
yarn add config-brick
# or
npm install config-brick
```

### use

```js
const { ConfigBrick } = require('config-brick')

// if want to config result {a:1,b:2} but into two bricks

const fn1 = opts => conf => {
  conf.a = 1
  return conf
}

const fn2 = opts => conf => {
  conf.b = 2
  return conf
}

// add brick to ConfigBrick.prototype
ConfigBrick.use({
  fn1: fn1,
  fn2: fn2
})

// get result
new ConfigBrick()
  .fn1()
  .fn2()
  .value()
// -> {a:1,b:2}
```

Constructor options

```js
new ConfigBrick({
  seed:{} // defautl {}
  debug:false
})

// with custom seed
new ConfigBrick({
  seed:{c:3}
})
  .fn1()
  .fn2()
  .value()
//-> {a:1,b:2,c:3}
```

## hard-disk file

now support output json file to hard dist

```js
new Conf().toJson('.tmp/config.json') // will output config.json
```

### when to use

let's make an example that you will build a webpack config builder or other complex config,you can use this

we want a config like this

```js
{
  entry:{
    main:'./src/main.js'
  },
  module:{
    rules:[
      {test:/\.js$/,loader:'babel-loader'},
      {test:/\.vue$/,loader:'vue-loader'},
      {test:/\.css$/,loader:'style-loader!css-loader'}
    ]
  },
  plugins:[
    new CopyPlugin()
  ]
}
```

let's build a webpackBrickBuilder based on ConfigBrick

```js
const {ConfigBrick,merge} = require('config-brick')

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
  return loaders([
    { test: /\.vue$/, loader: 'vue-loader' }
  ])(conf)
}

const babel = opts => conf => {
  return loaders([
    { test: /\.js$/, loader: 'babel-loader' }
  ])(conf)
}

const css = opts => conf => {
  return loaders([
    { test: /\.css$/, loader: 'style-loader!css-loader'}
  ])(conf)
}

WebpackBrick.use(plugins, loaders, vue, babel, css)
module.exports = WebpackBrick
```

then next you want to start a webpack project,just
```js
new WebpackBrick()
  .vue()
  .babel()
  .css()
  .plugins(
    [
      new CopyPlugin()
    ]
  )
  .value()

```


## some utils 

### merge
lodash merge but we concat array
https://lodash.com/docs/4.17.4#mergeWith

```js
const {merge} = require("config-brick")
const a = {a:1,b:2,c:[1]}
const b = {a:3,b:2,c:[2]}
merge(a,b) // -> {a:3,b:2,c:[1,2]}

```

### pipe 
ramda pipe function
http://ramda.cn/docs/#pipe
```js
const {pipe} = require("config-webpack")

const fn1 = a=>a+1
const fn2 = a=>a*2

const res = pipe(fn1,fn2)(3)

// res -> ( 3 + 1 ) * 2 = 8

```