const { ConfigBrick, merge, pipe } = require('../index')
const fse = require('fs-extra')

const Conf = ConfigBrick

const fn1 = opts => conf => {
  conf.a = 1
  return conf
}

const fn2 = opts => conf => {
  conf.b = 2
  return conf
}

const clearBricks = bricks => {
  bricks.forEach(b => {
    delete Conf.prototype[b]
  })
}

describe('ConfigBrick', () => {
  test('ConfigBrick exist', () => {
    expect(Conf).toBeDefined()
  })
  test('default config is an empty object', () => {
    expect(new Conf().value()).toEqual({})
  })
  test('should use seed object', () => {
    expect(new Conf({ seed: { a: 1 } }).value()).toEqual({
      a: 1
    })
  })

  test('should output json in default location', () => {
    const configPath = __dirname + '/../config.json'
    fse.removeSync(configPath)
    new Conf().toJson()
    const config = fse.readJsonSync(configPath, 'utf-8')
    expect(config).toEqual({})
  })

  test('should output correct json file', () => {
    const configPath = __dirname + '/dist/config.json'
    new Conf().toJson(configPath)
    const config = fse.readJsonSync(configPath, 'utf-8')
    expect(config).toEqual({})
  })

  test('should throw when .use options get not funciton', () => {
    expect(() => {
      Conf.use('a')
    }).toThrow()
  })

  test('should throw when brick builder is not function', () => {
    expect(() => {
      Conf.use(['a'])
    }).toThrow()
  })

  test('should add bricks from object', () => {
    Conf.use({
      fn1,
      fn2
    })
    const res = new Conf()
      .fn1()
      .fn2()
      .value()
    expect(res).toEqual({
      a: 1,
      b: 2
    })
    // clear prototype
    clearBricks(['fn1', 'fn2'])
  })

  test('should add bricks from array', () => {
    Conf.use([fn1, fn2])
    const res = new Conf()
      .fn1()
      .fn2()
      .value()
    expect(res).toEqual({
      a: 1,
      b: 2
    })
    clearBricks(['fn1', 'fn2'])
  })

  test('should add bricks from two more arguments', () => {
    Conf.use(fn1, fn2)
    const res = new Conf()
      .fn1()
      .fn2()
      .value()
    expect(res).toEqual({
      a: 1,
      b: 2
    })
    clearBricks(['fn1', 'fn2'])
  })

  test('should merge config with seed', () => {
    Conf.use(fn1, fn2)
    const res = new Conf({ seed: { c: 3 } })
      .fn1()
      .fn2()
      .value()
    expect(res).toEqual({
      a: 1,
      b: 2,
      c: 3
    })
    clearBricks(['fn1', 'fn2'])
  })
  test('should bebug ', () => {
    Conf.use(fn1)
    new Conf({ debug: true }).fn1().value()
  })
})

describe('merge behavior', () => {
  test('merge exist', () => {
    expect(merge).toBeDefined()
  })
  test('shoud concat array when merge', () => {
    expect(merge({ a: [1] }, { a: [2] })).toEqual({
      a: [1, 2]
    })
  })
})

describe('pipe behavior', () => {
  test('pipe exist', () => {
    expect(pipe).toBeDefined()
  })
  test('pipe work', () => {
    expect(pipe(fn1(), fn2())({})).toEqual({
      a: 1,
      b: 2
    })
  })
})
