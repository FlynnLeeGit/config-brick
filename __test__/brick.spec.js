const $b = require('../index')
const fse = require('fs-extra')

const fn1 = opts => conf => ((conf.a = 1), conf)
const fn2 = opts => conf => ((conf.b = 2), conf)

describe('ConfigBrick', () => {
  test('ConfigBrick exist', () => {
    expect($b).toBeDefined()
  })
  test('default config is an empty object', () => {
    expect($b().value()).toEqual({})
  })
  test('should use seed object', () => {
    expect($b({ a: 1 }).value()).toEqual({
      a: 1
    })
  })

  test('should output json in default location', () => {
    const configPath = __dirname + '/../config.json'
    fse.removeSync(configPath)
    $b().toJson()
    const config = fse.readJsonSync(configPath, 'utf-8')
    expect(config).toEqual({})
  })

  test('should output correct json file', () => {
    const configPath = __dirname + '/dist/config.json'
    $b().toJson(configPath)
    const config = fse.readJsonSync(configPath, 'utf-8')
    expect(config).toEqual({})
  })

  test('should throw when .registerBrick options get not an object', () => {
    expect(() => {
      $b.registerBrick('a')
    }).toThrow()
  })

  test('should throw when brick builder is not function', () => {
    expect(() => {
      $b.registerBrick({
        a: 'a'
      })
    }).toThrow()
  })

  test('should add bricks from object', () => {
    $b.registerBrick({
      fn1,
      fn2
    })
    const res = $b()
      .fn1()
      .fn2()
      .value()
    expect(res).toEqual({
      a: 1,
      b: 2
    })
    // clear prototype
    $b.removeBrick('fn1', 'fn2')
  })

  test('should merge config with seed', () => {
    $b.registerBrick({
      fn1,
      fn2
    })
    const res = $b({ c: 3 })
      .fn1()
      .fn2()
      .value()
    expect(res).toEqual({
      a: 1,
      b: 2,
      c: 3
    })
    $b.removeBrick('fn1', 'fn2')
  })

  test('should bebug ', () => {
    $b.registerBrick({ fn1 })
    const b = $b()
      .debug()
      .fn1()
    expect(b._debug).toBeTruthy()
    $b.removeBrick('fn1')
  })

  test('should get correct name', () => {
    $b.NAME = '[WebpackBrick]'
    $b.THEME = 'yellow'
    expect($b()._name).toBe("\u001b[33m[WebpackBrick]\u001b[39m")
  })
})

describe('pipe brick', () => {
  test('should exist', () => {
    expect($b.bricks.pipe).toBeDefined()
  })
  test('should pipe conf data', () => {
    expect(
      $b()
        .pipe([fn1(), fn2()])
        .value()
    ).toEqual({
      a: 1,
      b: 2
    })
  })
})

describe('if brick', () => {
  test('should exist', () => {
    expect($b.bricks.if).toBeDefined()
  })
  test('should merge conf when if true', () => {
    const conf = $b()
      .if(true, [fn1()])
      .value()
    expect(conf).toEqual({
      a: 1
    })
  })
  test('should not merge conf when if false', () => {
    const conf = $b()
      .if(false, [fn1()])
      .value()
    expect(conf).toEqual({})
  })
})

describe('merge brick', () => {
  test('exist', () => {
    expect($b.bricks.merge).toBeDefined()
  })
  test('should merge when object key', () => {
    const conf = $b({ a: 3 })
      .merge({ a: 2 })
      .value()
    expect(conf).toEqual({
      a: 2
    })
  })
  test('should concat arr conf', () => {
    const conf = $b({ a: [1] })
      .merge({ a: [2] })
      .value()
    expect(conf).toEqual({ a: [1, 2] })
  })
})
