const pipeBrick = fns => conf => {
  if (!Array.isArray(fns)) {
    fns = []
  }
  return fns.reduce((conf, fn) => {
    return fn(conf)
  }, conf)
}

module.exports = pipeBrick