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
  // return the config result you want,
  // if not give the return value,it will use conf as the output
  // this output result will be next function's input
  return conf
}

const fn2 = opts => conf => {
  conf.b = 2
  return conf
}

// async SBF
const fn3 = opts => (conf, next) => {
  conf.c = 3
  // must call next function or it will never resolved
  setTimeout(() => {
    next()
  })
}

// async SBF with next arguments
const fn4 = opts => (conf, next) => {
  conf.d = 4
  setTimeout(() => {
    next({
      e: 5
    })
  })
} // will be {e:5}
```

### use SBF

```js
const $b = require('config-brick')
// register SBF first
$b.registerBrick({
  fn1: fn1,
  fn2: fn2
})
// or
$b.use({
  fn1,
  fn2
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
  .if(
    bool,
    // when it's function
    conf => {
      $b(conf)
        .fn1()
        .value()
    },
    conf =>
      $b(conf)
        .fn2()
        .value()
  )
  .value()
// true will be {a:1}
// false will be {b:2}
```

when it's a array
it will pipe the function as the final result

```js
$b().if(bool, [fn1()], [fn2()])
```

also can be basic type

```js
$b()
  .if(bool, 3, 2)
  .value()
// result true will be 3
// false will be 2
```

### with async brick function

```js
const p = $b()
  .fn3()
  .value()
// when detect you used `next`, .value() will a promise instance
// async function will be excuted by waterfall

// so
p.then(conf=>{
  console.log('done',conf) // final result
})

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

const plugins = (plugins = []) => conf => {
  return $b(conf)
    .merge({
      plugins: [...plugins]
    })
    .value()
}
const rules = (rules = []) => conf => {
  return $b(conf)
    .merge({
      module: {
        rules: [...rules]
      }
    })
    .value()
}

$b.registerBrick({
  plugins,
  rules
})

const vue = () => conf => {
  return $b(conf)
    .rules([{ test: /\.vue$/, loader: 'vue-loader' }])
    .value()
}
const babel = () => conf => {
  return $b(conf)
    .rules([{ test: /\.js$/, loader: 'babel-loader' }])
    .value()
}
const css = () => conf => {
  return $b(conf)
    .rules([{ test: /\.css$/, loader: 'style-loader!css-loader' }])
    .value()
}

const $wb = $b.registerBrick({
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
