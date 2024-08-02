const transformScript = require("../transform-script")

describe("basic expression", () => {
  test("literal string", () => {
    const code = `console.log("hello world")`
    expect(transformScript(code)).toStrictEqual([["hello world"]])
  })

  test("contains identifier", () => {
    const code = `
      const x = 10
      console.log(x)
    `
    expect(transformScript(code)).toStrictEqual([[10]])
  })

  test("contains array", () => {
    const code = `
      const x = [1, 2, 3]
      console.log(x)
    `
    expect(transformScript(code)).toStrictEqual([[[1, 2, 3]]])
  })

  test("contains object", () => {
    const code = `
      const x = { a: 1, b: 2 }
      console.log(x)
    `
    expect(transformScript(code)).toStrictEqual([[{ a: 1, b: 2 }]])
  })

  test("contains function", () => {
    const code = `
      function foo() {
        return "bar"
      } 
      console.log(foo())
    `
    expect(transformScript(code)).toStrictEqual([["bar"]])
  })
})

describe("binary expression", () => {
  test("basic", () => {
    const code = `console.log(1 + 2)`
    expect(transformScript(code)).toStrictEqual([[3]])
  })

  test("contains identifier", () => {
    const code = `
      const x = 10
      console.log(2 + x)
    `
    expect(transformScript(code)).toStrictEqual([[12]])
  })

  test("contains array", () => {
    const code = `console.log(2 + [1, 2])`
    expect(transformScript(code)).toStrictEqual([["21,2"]])
  })

  test("contains object", () => {
    const code = `console.log(1 + {})`
    expect(transformScript(code)).toStrictEqual([["1[object Object]"]])
  })

  test("contains boolean", () => {
    const code = `console.log(1 + true)`
    expect(transformScript(code)).toStrictEqual([[2]])
  })
})

