const timeouts = require("./timeouts")

function clearTimeouts() {
  for (let timeout of timeouts) {
    clearTimeout(timeout)
  }
  timeouts.length = 0
}

module.exports = clearTimeouts