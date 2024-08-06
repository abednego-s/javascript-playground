const { parseSync } = require("@babel/core");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types")

const log = console.log
const intervalIds = []
const intervalDelays = []
const timeoutIds = []
const timeoutDelays = []

function stopIntervals() {
  for (let index = 0; index < intervalIds.length; index++) {
    clearInterval(intervalIds[index])
  }
}

function stopTimeouts() {
  for (let index = 0; index < timeoutIds.length; index++) {
    clearInterval(timeoutIds[index])
  }
}

function runScript(script, callback) {
  const logs = []
  const ast = parseSync(script)

  traverse(ast, {
    CallExpression(path) {
      const delay = path.node.arguments[1]
      if (t.isIdentifier(path.node.callee, { name: "setInterval" })) {
        intervalDelays.push(delay.value)
      }

      if (t.isIdentifier(path.node.callee, { name: "setTimeout" })) {
        timeoutDelays.push(delay.value)
      }
    }
  })

  stopIntervals()
  stopTimeouts()

  console.log = function () {
    const args = Array.from(arguments);
    log.apply(console, args)
    logs.push(args)
  }

  new Function(script)()

  for (let index = 0; index < intervalDelays.length; index++) {
    intervalIds[index] = setInterval(() => {
      callback(logs)
    }, intervalDelays[index])
  }

  for (let index = 0; index < timeoutDelays.length; index++) {
    timeoutIds[index] = setTimeout(() => {
      callback(logs)
    }, timeoutDelays[index])
  }

  return logs
}

// log(runScript(`
//   console.log("hello world")
// `))

module.exports = runScript