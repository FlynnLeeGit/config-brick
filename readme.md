## config-brick 2.0

[![CircleCI](https://circleci.com/gh/FlynnLeeGit/config-brick.svg?style=svg)](https://circleci.com/gh/FlynnLeeGit/config-brick)

use standard brick function to build complex config easier

### install

```shell
yarn add config-brick
# or
npm install config-brick
```

## use with sync functions

```js
const fn0 = () => {
  console.log('hello')
}
const fn1 = conf => {
  conf.a = 1
}
const fn2 = conf => {
  conf.b = 2
  return conf
}
const fn3 = conf => {
  conf.c = 3
  return {
    d: 4
  }
}
const fn4 = 3
```

#### lay function, like a `pipe`

```js
const { lay } = require('config-brick')

const conf1 = lay()() // {}

// use initial value,default is {}
const conf2 = lay()({ initial: 'this is a initial seed' }) // {initial:'this is a initial seed'}
// with no returned function,it will use pre result
const conf3 = lay(fn1)() // {a:1}
const conf4 = lay(fn1, fn2)() // {a:1,b:2}
const conf5 = lay(fn1, fn2, fn3)() // {d:4} because fn3 return {d:4}
const conf6 = lay(fn4)() // {}  fn4 not a function,return pre result
```

## use with Async Function

```js
const fn5 = (conf, next) => {
  setTimeout(() => {
    conf.e = 5
    // must call,or it will never resolved
    next()
  })
}

const fn6 = (conf, next) => {
  setTimeout(() => {
    conf.f = 6
    // a new value
    next(conf)
  })
}

// notice should resolved a function,not the conf value
const fn7 = new Promise((resolve, reject) => {
  // give a name,for debug
  const fn7Brick = conf => {
    conf.g = 7
  }
  // this is function
  return fn7Brick
})
```

#### use lay with async function

```js
const { lay } = require('config-brick')

// detect it has async function ,so p will be a Promise instance
const p = lay(fn1, fn2, fn3)()

p.then(conf => {
  // {e:5,f:6,g:7}
})
```

#### you can mix sync function and async function,that's ok

```js
const p = lay(fn1, fn5, fn6)()
p.then(conf => {
  // {a:1,e:5,f:6}
})
```

## with control flow

```js
const { when, lay } = require('config-brick')

const conf = lay(
  fn1, //
  when(true, [fn2])
)()

// {a:1,b:2}

const p1 = lay(
  fn1, //
  // here fn4 is async,so final will be a Promise
  when(true, [fn5])
)
p1.then(conf => {
  // {a:1,e:5}
})
```

## pipe

```js
const { pipe } = require('config-brick')

// pipe function is  like `lay`,but this only support sync function,
pipe(fn1, fn2)() // {a:1,b:2}

pipe(fn5)() // Error
```

## pipeAsync

```js
const { pipeAsync } = require('config-brick')
// pipeAsync function is  like `lay`,but it will always return a Promise
const p = pipeAsync(fn1)() // it will be a Promise
p.then(conf => {
  // {a:1}
})
```

## merge

```js
const { merge } = require('config-brick')
// notice here is,merge(right value)(left value),data always last 
merge({ a: 1, b: [1] })({ a: 2, b: [2] })
// -> {a:1,b:[1,2]}
```
