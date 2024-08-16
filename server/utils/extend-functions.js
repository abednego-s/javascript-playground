const origSetTimeout = global.setTimeout
const origSetInterval = global.setInterval
const timeouts = []
const intervals = []

global.setTimeout = function (fn, delay, ...args) {
  const id = origSetTimeout(fn, delay, ...args)
  timeouts.push(id)
  return id
}

global.setInterval = function (fn, delay, ...args) {
  const id = origSetInterval(fn, delay, ...args)
  intervals.push(id)
  return id
}

function clearTimeouts() {
  for (let timeout of timeouts) {
    clearTimeout(timeout)
  }
  timeouts.length = 0

}

function clearIntervals() {
  for (let interval of intervals) {
    clearInterval(interval)
  }
  intervals.length = 0
}

module.exports = {
  clearTimeouts,
  clearIntervals
}

