const pipeBrick = fns => conf => {
  if (!Array.isArray(fns)) {
    fns = []
  }
  return fns.reduce((conf, fn) => {
    // handler
    const res = fn(conf)
    if (res) {
      return res
    }
    return conf
  }, conf)
}

module.exports = pipeBrick
