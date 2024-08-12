const orig = console.log
export function runScript(script, callback) {
  const logs = []
  const logProxy = new Proxy(logs, {
    set(target, property, value) {
      target[property] = value
      if (Array.isArray(value)) {
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
    orig.apply(console, args)
    logProxy.push(args)
  }

  new Function(script)()
  return logs
}