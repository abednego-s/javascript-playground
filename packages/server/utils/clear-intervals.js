const intervals = require("./intervals")

function clearIntervals() {
  for (let interval of intervals) {
    clearInterval(interval)
  }
  intervals.length = 0
}

module.exports = clearIntervals