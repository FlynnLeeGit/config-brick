const $ = require('../index')

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
    c: 3
  }
}
const fn4 = (conf, next) => {
  conf.d = 4
  next()
}

const fn5 = (conf, next) => {
  setTimeout(() => {
    conf.e = 5
    next(conf)
  })
}
const fn6 = (conf, next) => {
  setTimeout(() => {
    conf.f = 6
    next({
      f: 6
    })
  })
}
const fn7 = conf =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      conf.g = 7
      resolve()
    })
  })
const fn8 = conf =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      conf.h = 8
      resolve(conf)
    })
  }, 300)
const fn9 = conf =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      conf.i = 9
      resolve({
        i: 9
      })
    }, 200)
  })

describe('basic', () => {
  test('should config-brick exist', () => {
    expect($).toBeDefined()
  })
})

describe('lay brick', () => {
  test('should exist', () => {
    expect($.bricks.lay).toBeDefined()
    expect($.bricks.layAsync).toBeDefined()
  })
  test('should default right', () => {
    const conf = $().lay()
    expect(conf).toEqual({})
  })
  test('should seed right', () => {
    const conf = $({ a: 1 }).lay()
    expect(conf).toEqual({ a: 1 })
  })
  test('should sync bricks right', () => {
    const conf = $().lay([
      fn1, //
      fn2
    ])
    expect(conf).toEqual({
      a: 1,
      b: 2
    })
  })
  test('should async lay right', done => {
    const p = $().layAsync([fn7])
    p.then(conf => {
      expect(conf).toEqual({ g: 7 })
      done()
    })
  })
  test('should mix sync lay ok', () => {
    const conf = $().lay([fn1, fn2, fn3])
    expect(conf).toEqual({
      c: 3
    })
  })

  test('should mix sync && async brick ok', done => {
    const p = $().layAsync([fn1, fn2, fn3, fn7, fn8, fn9])
    p.then(conf => {
      expect(conf).toEqual({
        i: 9
      })
      done()
    })
  })
  test('should throw when use lay with async brick', () => {
    expect(() => {
      $().lay([fn7])
    }).toThrow()
  })
  test('should warn when use layAsync with all sync bricks', () => {
    $().layAsync()
  })
})

describe('merge brick', () => {
  test('should merge right', () => {
    const conf = $({
      a: [1],
      b: 2
    }).merge({
      a: [2],
      b: 3
    })
    expect(conf).toEqual({
      a: [1, 2],
      b: 3
    })
  })
  test('should not merge array', () => {
    expect($({ a: [1] }).merge({ a: [1] })).toEqual({
      a: [1]
    })
  })
})

describe('if brick', () => {
  test('should if sync default ok', () => {
    const conf = $().lay([$.bricks.if(true)])
    expect(conf).toEqual({})
  })
  test('should if sync right', () => {
    let bool = true
    const conf = $().lay([
      fn1, //
      $.bricks.if(
        bool, //
        [fn2]
      )
    ])
    expect(conf).toEqual({
      a: 1,
      b: 2
    })
    bool = false
    const conf2 = $().lay([
      fn1, //
      $.bricks.if(
        bool, //
        [fn2],
        [fn3]
      )
    ])
    expect(conf2).toEqual({
      c: 3
    })
  })
  test('should async if ok', done => {
    $()
      .layAsync([
        fn7, //
        $.bricks.ifAsync(
          true, //
          [fn8]
        )
      ])
      .then(conf => {
        expect(conf).toEqual({
          g: 7,
          h: 8
        })
        done()
      })
  })
})
