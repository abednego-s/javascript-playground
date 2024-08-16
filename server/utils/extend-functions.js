const timeouts = require("./timeouts")
const intervals = require("./intervals")
const origSetTimeout = global.setTimeout
const origSetInterval = global.setInterval

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