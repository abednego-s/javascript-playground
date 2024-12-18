function replacer(array) {
  const result = array.reduce((prev, current) => {
    if (Array.isArray(current)) {
      const replacement = replacer(current)
      prev = [...prev, replacement]
    } else {
      if (current === undefined) {
        prev = [...prev, "undefined"]
      } else if (current === null) {
        prev = [...prev, "null"]
      } else if (typeof current === "function" || typeof current === "object" && current.constructor !== Object) {
        prev = [...prev, String(current)]
      } else {
        prev = [...prev, current]
      }
    }
    return prev
  }, [])

  return result
}

module.exports = replacer