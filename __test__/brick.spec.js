const $ = require('../index')
const fse = require('fs-extra')
const path = require('path')

// is not a function,it will return `pre output`
const fnZ1 = 1
const fnZ2 = { z1: 'z1' }
const fnZ3 = [2, 3]
const fnZ4 = 'string'

// no return,it will return `pre output`
const fnA0 = () => {
  console.log('here')
}
// no return,so default it will return  `pre output`
const fnA1 = conf => {
  conf.a1 = 'a1'
}
// return conf
const fnA2 = conf => {
  conf.a2 = 'a2'
  return conf
}
// return new_data,next input will be {c:3}
const fnA3 = conf => {
  conf.a3 = 'a3'
  return {
    c: 3
  }
}

// no next arguments,will resolved by `conf` value
const fnB1 = (conf, next) => {
  setTimeout(() => {
    conf.b1 = 'b1'
    next()
  })
}
// resolved by `conf`
const fnB2 = (conf, next) => {
  setTimeout(() => {
    conf.b2 = 'b2'
    next(conf)
  })
}

// resolved by a new value, here {c:3}
const fnB3 = (conf, next) => {
  setTimeout(() => {
    conf.b3 = 'b3'
    next({
      c: 3
    })
  })
}

const fnC1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(conf => {
      conf.c1 = 'c1'
    })
  }, 200)
})
fnC1.name = 'fnC1'

const fnC2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(conf => {
      conf.c2 = 'c2'
      return conf
    })
  }, 200)
})
fnC2.name = 'fnC2'

const fnC3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(conf => {
      conf.c3 = 'c3'
      return {
        c: 3
      }
    })
  }, 200)
})
fnC3.name = 'fnC3'

const fnC4 = new Promise((resolve, reject) => {
  resolve(3)
})
fnC4.name = 'fnC4'

/**
 * TEST
 */

describe('basic', () => {
  test('should exists ', () => {
    expect($.lay).toBeDefined()
    expect($.merge).toBeDefined()
    expect($.outputJson).toBeDefined()
    expect($.pipe).toBeDefined()
    expect($.pipeAsync).toBeDefined()
    expect($.when).toBeDefined()
  })
})

describe('merge brick', () => {
  test('should ok', () => {
    expect($.merge({ a: 1 })({ a: 2 })).toEqual({
      a: 1
    })
  })
  test('should array ok', () => {
    expect($.merge({ a: [1, 2] })({ a: [1] })).toEqual({
      a: [1, 2]
    })
  })
})

describe('lay brick', () => {
  test('should sync function ok', () => {
    const conf = $.lay(fnA0, fnA1, fnA2)()
    expect(conf).toEqual({
      a1: 'a1',
      a2: 'a2'
    })
  })
  test('should sync value ok', () => {
    const conf = $.lay(fnZ1)()
    expect(conf).toEqual({})
  })
  
  test('should async promise function ok', done => {
    const p = $.lay(fnC1)()
    p.then(conf => {
      expect(conf).toEqual({
        c1: 'c1'
      })
      done()
    })
  })
  test('should async mixed function ok', done => {
    const p = $.lay(fnA1, fnA2, fnC1, fnC2, fnZ1)()
    p.then(conf => {
      expect(conf).toEqual({
        a1: 'a1',
        a2: 'a2',
        c1: 'c1',
        c2: 'c2'
      })
      done()
    })
  })
  test('shoud return pre data,when resolved is not a function', done => {
    const p = $.lay(fnC4)()
    p.then(conf => {
      expect(conf).toEqual({})
      done()
    })
  })
})

describe('outputJson', () => {
  test('should default ok', () => {
    $.lay(fnA1, $.outputJson())()
    const filepath = path.join(__dirname, '../config.json')
    const conf = fse.readJsonSync(filepath, 'utf-8')
    expect(conf).toEqual({
      a1: 'a1'
    })
    fse.removeSync(filepath)
  })
  test('should filepath ok', () => {
    const filepath = path.join(__dirname, './config.json')
    $.lay(fnA1, $.outputJson(filepath))()
    const conf = fse.readJsonSync(filepath, 'utf-8')
    expect(conf).toEqual({
      a1: 'a1'
    })
    fse.removeSync(filepath)
  })
})

describe('when brick', () => {
  test('should true when ok', () => {
    const conf = $.lay(fnA1, $.when(true, [fnA2], []))()
    expect(conf).toEqual({
      a1: 'a1',
      a2: 'a2'
    })
  })
  test('should false when ok', () => {
    const conf = $.lay(fnA1, $.when(false, [], [fnA2]))()
    expect(conf).toEqual({
      a1: 'a1',
      a2: 'a2'
    })
  })
})
