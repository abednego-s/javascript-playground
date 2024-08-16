require("./extend-functions")
const clearIntervals = require("./clear-intervals")
const clearTimeouts = require("./clear-timeouts")
const origConsoleLog = console.log

function runScript(script, callback = null) {
  clearIntervals()
  clearTimeouts()

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
    origConsoleLog.apply(console, args)
    logProxy.push(args)
  }

  new Function(`${script}`)()
  return logs
}

module.exports = runScript