const originalConsoleLog = console.log
const originalSetTimeout = global.setTimeout
const originalSetInterval = global.setInterval
const timeouts = []
const intervals = []

global.setTimeout = function (fn, delay, ...args) {
  const id = originalSetTimeout(fn, delay, ...args)
  timeouts.push(id)
  return id
}

global.setInterval = function (fn, delay, ...args) {
  const id = originalSetInterval(fn, delay, ...args)
  intervals.push(id)
  return id
}

function runScript(script, callback = null) {
  for (let timeout of timeouts) {
    clearTimeout(timeout)
  }

  for (let interval of intervals) {
    clearInterval(interval)
  }

  timeouts.length = 0
  intervals.length = 0

  const logs = []
  const logProxy = new Proxy(logs, {
    set(target, property, value) {
      target[property] = value
      if (callback && Array.isArray(value)) {
        callback(target)
      }
      return true
    },
    get(target, property) {
      return target[property]
    }
  })

  console.log = function () {
    const args = Array.from(arguments);
    originalConsoleLog.apply(console, args)
    logProxy.push(args)
  }

  new Function(`${script}`)()
  return logs
}

module.exports = runScript