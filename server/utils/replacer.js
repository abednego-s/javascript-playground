function replacer(array) {
  return array.map((element) => {
    if (typeof element === "function") {
      return String(element)
    } else if (element === undefined) {
      return "undefined"
    } else if (Array.isArray(element)) {
      return replacer(element)
    }
    return element
  })
}

module.exports = replacer