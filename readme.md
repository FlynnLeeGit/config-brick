## config-brick 2.0 

[![CircleCI](https://circleci.com/gh/FlynnLeeGit/config-brick.svg?style=svg)](https://circleci.com/gh/FlynnLeeGit/config-brick)

use standard brick function to build complex config easier

### install

```shell
yarn add config-brick
# or
npm install config-brick
```

### standard brick function

all config is produced by standard brick function (SBF)

```js
// simplest brick function
const fn1 = opts => conf => {
  // opts can be fn1's options
  conf.a = 1
  // shoud return the config result you want,
  // this output result will be next function's input
  return conf
}

const fn2 = opts => conf => {
  conf.b = 2
  return conf
}
```

### use SBF

```js
const $b = require('config-brick')
// register SBF first
$b.registerBrick({
  fn1: fn1,
  fn2: fn2
})

// then you can use it by chain
$b()
  .fn1()
  .fn2()
  .value()
// notice .value() to get the final config result,or you will just get the
// brick instance
// -> produce {a:1,b:3}
```

### initialSeedConfig

```js
$b({ c: 3 })
  .fn1()
  .fn2()
  .value()
// -> {a:1,b:2,c:3}
```

## some internal bricks already registered

### merge

concat array

```js
$b({ a: [1], b: 2 })
  .merge({ a: [2], b: 3 })
  .value()

// -> {a:[1,2],b:3}
```

### pipe

data transform from left to right,

```js
$b()
  .pipe([fn1(), fn2()])
  .value()
// will be {a:1,b:2}
```

### if

flow control

```js
const bool = true
$b()
  .if(bool, [fn1()], [fn2()])
  .value()
// true will be {a:1}
// false will be {b:2}
```

### complex example

let's start with a webpack config file
you want this config

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

use config-brick

```js
// first predefined some bricks you want
const $b = require('config-brick')
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

// use it !
const $wb = webpackBrick
$wb({
  entry: {
    main: './src/main.js'
  }
})
  .vue()
  .babel()
  .css()
  .plugins([new CopyPlugin()])
  .value()
```
