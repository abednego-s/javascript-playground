const utils = require("../transform-script")

test("basic expression", () => {
  const code = `console.log("hello world")`
  expect(utils(code)).toStrictEqual([["hello world"]])
})