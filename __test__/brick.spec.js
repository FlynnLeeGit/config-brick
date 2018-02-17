const $b = require('../index')
const fse = require('fs-extra')
const chalk = require('chalk')

const fn1 = opts => conf => ((conf.a = 1), conf)
const fn2 = opts => conf => ((conf.b = 2), conf)

const clearBrick = (...bricks) => {
  bricks.forEach(b => {
    $b.prototype[b] = null
    $b.bricks[b] = null
  })
}

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
    $b()
      .toJson()
      .done()
    const config = fse.readJsonSync(configPath, 'utf-8')
    expect(config).toEqual({})
    fse.removeSync(configPath)
  })

  test('should output correct json file', () => {
    const configPath = __dirname + '/dist/config.json'
    fse.removeSync(configPath)
    $b.use({
      fn1
    })
    $b()
      .fn1()
      .toJson(configPath)
      .done()
    const config = fse.readJsonSync(configPath, 'utf-8')
    expect(config).toEqual({ a: 1 })
    clearBrick('fn1')
    fse.removeSync(configPath)
  })

  test('should async output json ok', done => {
    const configPath = __dirname + '/dist/async/config.json'
    fse.removeSync(configPath)
    const fn1 = () => (conf, next) => {
      conf.a = 1
      next()
    }
    $b.use({
      fn1
    })
    $b()
      .fn1()
      .toJson(configPath)
      .done()
      .then(() => {
        const config = fse.readJsonSync(configPath, 'utf-8')
        expect(config).toEqual({ a: 1 })
        done()
        clearBrick('fn1')
        fse.removeSync(configPath)
      })
  })

  test('should debug ok', () => {
    const isDebug = $b().debug()._debug
    expect(isDebug).toBeTruthy()
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
    clearBrick('fn1', 'fn2')
  })

  describe('extend behaviors', () => {
    const $nb = $b.extend()
    test('should exist', () => {
      expect($nb).toBeDefined()
      expect($nb.Name).toBeDefined()
      expect($nb.use).toBeDefined()
    })
    test('should registerBrick on just own Ctor', () => {
      $b.registerBrick({
        fn1,
        fn2
      })
      $nb.registerBrick({
        fn3: () => conf => ((conf.c = 3), conf)
      })

      expect(() => {
        $b.fn3()
      }).toThrow()

      expect(
        $nb()
          .fn1()
          .fn2()
          .fn3()
          .value()
      ).toEqual({
        a: 1,
        b: 2,
        c: 3
      })
    })
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
    clearBrick('fn1', 'fn2')
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
  test('should ok when it is not a array', () => {
    $b.use({
      fn1
    })
    const conf = $b()
      .fn1()
      .pipe()
      .value()
    expect(conf).toEqual({ a: 1 })
    clearBrick('fn1')
  })

  test('should return conf when undefined data returned', () => {
    expect(
      $b()
        .pipe([
          conf => {
            conf.d = 4
          }
        ])
        .value()
    ).toEqual({
      d: 4
    })
  })
})

describe('if brick', () => {
  test('should exist', () => {
    expect($b.bricks.if).toBeDefined()
  })
  test('should merge conf when if true', () => {
    $b.use({
      fn1
    })
    const conf = $b()
      .if(true, conf =>
        $b(conf)
          .fn1()
          .value()
      )
      .value()
    expect(conf).toEqual({
      a: 1
    })
    clearBrick('fn1')
  })

  test('should use default behavie', () => {
    expect(
      $b()
        .if(true)
        .value()
    ).toEqual({})
  })
  test('should not merge conf when if false', () => {
    const conf = $b()
      .if(false, conf =>
        $b(conf)
          .fn1()
          .value()
      )
      .value()
    expect(conf).toEqual({})
  })

  test('should work when array', () => {
    expect(
      $b()
        .if(true, [fn1()])
        .value()
    ).toEqual({
      a: 1
    })
    expect(
      $b()
        .if(false, [fn1()], [fn2()])
        .value()
    ).toEqual({
      b: 2
    })
  })

  test('shoud correct when no return', () => {
    expect(
      $b()
        .if(true, conf => {
          conf.a = 3
        })
        .value()
    ).toEqual({
      a: 3
    })
    expect(
      $b()
        .if(
          false,
          conf => {
            conf.a = 3
          },
          conf => {
            conf.b = 6
          }
        )
        .value()
    ).toEqual({
      b: 6
    })
  })

  test('should transform by basic type', () => {
    expect(
      $b()
        .if(true, 1, 2)
        .value()
    ).toEqual(1)

    expect(
      $b()
        .if(false, 1, 2)
        .value()
    ).toEqual(2)
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
  test('should not concat item when equal', () => {
    expect(
      $b({ a: [1] })
        .merge({ a: [1] })
        .value()
    ).toEqual({ a: [1] })
    expect(
      $b({ a: [{ test: '3' }] })
        .merge({ a: [{ test: '3' }] })
        .value()
    ).toEqual({
      a: [{ test: '3' }]
    })
  })
})

describe('script brick ok', () => {
  test('should exist', () => {
    expect($b.prototype.script).toBeDefined()
  })

  test('should excute script', () => {
    $b.use({
      fn1
    })
    let count = 0
    const conf = $b()
      .script(conf => {
        count++
      })
      .fn1()
      .value()
    expect(count).toBe(1)
    expect(conf).toEqual({
      a: 1
    })
    clearBrick('fn1')
  })
  test('should throw when script is not a function', () => {
    expect(() => {
      $b()
        .script(3)
        .value()
    }).toThrow()
  })
})

describe('complex example', () => {
  const $b2 = $b.extend()
  const loaderBrick = rule => conf => {
    return $b2(conf)
      .merge({
        rules: [rule]
      })
      .value()
  }

  $b2.registerBrick({
    loader: loaderBrick
  })

  const imageBrick = opt => conf => {
    const defaultOpt = {
      limit: 1000
    }
    return $b2(conf)
      .loader({
        loader: 'vue-loader',
        options: new $b2(defaultOpt).merge(opt).value()
      })
      .value()
  }

  $b2.registerBrick({
    image: imageBrick
  })

  test('should take effect ', () => {
    expect(
      $b2()
        .image()
        .value()
    ).toEqual({
      rules: [
        {
          loader: 'vue-loader',
          options: {
            limit: 1000
          }
        }
      ]
    })
  })
})

describe('async brick function support', () => {
  // sync with no return
  const fn5 = opt => conf => {
    conf.a = 1
  }

  // sync with return
  const fn6 = opt => conf => {
    conf.b = 2
    return {
      b: 22
    }
  }

  // async with next but not args
  const fn7 = opt => (conf, next) => {
    conf.c = 3
    next()
  }

  // async with next with data
  const fn8 = opt => (conf, next) => {
    conf.d = 4
    next({
      e: 5
    })
  }

  const $b3 = $b

  $b3.registerBrick({
    fn5,
    fn6,
    fn7,
    fn8
  })

  test('should return original conf when no bricks queue', () => {
    const res = $b3().value()
    expect(res).toEqual({})
  })
  test('sync brick no return', () => {
    const res = $b3()
      .fn5()
      .value()
    expect(res).toEqual({ a: 1 })
  })
  test('sync brick has return', () => {
    expect(
      $b3()
        .fn6()
        .value()
    ).toEqual({ b: 22 })
  })
  test('async brick no next arg', done => {
    $b3()
      .fn7()
      .value()
      .then(res => {
        expect(res).toEqual({
          c: 3
        })
        done()
      })
  })
  test('async brick has next arg', () => {
    $b3()
      .fn8()
      .value()
      .then(res => {
        expect(res).toEqual({
          e: 5
        })
      })
  })
  test('should correct when compose all', () => {
    $b3()
      .fn5()
      .fn6()
      .fn7()
      .fn8()
      .value()
      .then(res => {
        expect(res).toEqual({ e: 5 })
      })
  })
})
