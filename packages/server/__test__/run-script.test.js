const runScript = require("../utils/run-script")

describe("basic expression", () => {
  test("literal string", () => {
    const code = `console.log("hello world")`
    expect(runScript(code)).toStrictEqual([["hello world"]])
  })

  test("contains identifier", () => {
    const code = `
      const x = 10
      console.log(x)
    `
    expect(runScript(code)).toStrictEqual([[10]])
  })

  test("contains array", () => {
    const code = `
      const x = [1, 2, 3]
      console.log(x)
    `
    expect(runScript(code)).toStrictEqual([[[1, 2, 3]]])
  })

  test("contains object", () => {
    const code = `
      const x = { a: 1, b: 2 }
      console.log(x)
    `
    expect(runScript(code)).toStrictEqual([[{ a: 1, b: 2 }]])
  })

  test("contains function", () => {
    const code = `
      function foo() {
        return "bar"
      } 
      console.log(foo())
    `
    expect(runScript(code)).toStrictEqual([["bar"]])
  })

  test("contains nested function", () => {
    const code = `
      function foo(myArg) {
        return "foo" + myArg
      } 

      function bar() {
        return "bar"
      }
      console.log(foo(bar()))
    `
    expect(runScript(code)).toStrictEqual([["foobar"]])
  })
})

describe("binary expression", () => {
  test("basic", () => {
    const code = `console.log(1 + 2)`
    expect(runScript(code)).toStrictEqual([[3]])
  })

  test("contains identifier", () => {
    const code = `
      const x = 10
      console.log(2 + x)
    `
    expect(runScript(code)).toStrictEqual([[12]])
  })

  test("contains array", () => {
    const code = `console.log(2 + [1, 2])`
    expect(runScript(code)).toStrictEqual([["21,2"]])
  })

  test("contains object", () => {
    const code = `console.log(1 + {})`
    expect(runScript(code)).toStrictEqual([["1[object Object]"]])
  })

  test("contains boolean", () => {
    const code = `console.log(1 + true)`
    expect(runScript(code)).toStrictEqual([[2]])
  })

  test("[] + {}", () => {
    const code = "console.log([] + {})"
    expect(runScript(code)).toStrictEqual([["[object Object]"]])
  })
})

describe("with callback", () => {
  test("setTimeout", () => {
    jest.useFakeTimers()
    const callback = jest.fn();
    const code = `setTimeout(() => {
      console.log("hello")
    }, 1000)`
    const logs = runScript(code, callback)
    jest.runAllTimers() // fast-forward all timers
    expect(callback).toHaveBeenCalled()
    expect(logs).toStrictEqual([["hello"]])
  })
})
