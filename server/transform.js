
const { parseSync } = require("@babel/core");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types")
const generate = require("@babel/generator").default;
const template = require("@babel/template").default;

const LOG_VARIABLE_NAME = "JSPlaygroundLog"
const LOG_FUNCTION_NAME = "JSPlaygroundConsoleLog"

function exec(code) {
  const ast = parseSync(code)

  traverse(ast, {
    Program(path) {
      const { node: { body } } = path

      const buildLogVariable = template(`
        const %%LOG_VARIABLE_NAME%% = []
        `
      )
      const buildLogFunction = template(`
        function %%LOG_FUNCTION_NAME%%(item) { 
          %%LOG_VARIABLE_NAME%%.push([...item]) 
        }`
      )
      const logVariableNode = buildLogVariable({ LOG_VARIABLE_NAME })
      const logFunctionNode = buildLogFunction({ LOG_FUNCTION_NAME, LOG_VARIABLE_NAME })
      body.unshift(logVariableNode)
      body.push(logFunctionNode)
    },
    CallExpression(path) {
      const { node } = path
      const args = []
      const argn = []

      node.arguments.forEach((arg) => {
        if (t.isLiteral(arg)) {
          args.push(arg.value)
        } else if (t.isIdentifier(arg)) {
          args.push(arg.name)
          argn.push(arg.name)
        } else if (t.isCallExpression(arg)) {
          args.push(arg.callee.name + "()")
          argn.push(arg.callee.name)
        } else if (t.isArrayExpression(arg)) {
          console.log("ArrayExpression is not supported")
        } else if (t.isObjectExpression(arg)) {
          console.log("ObjectExpression is not supported")
        } else if (t.isBinaryExpression(arg)) {
          console.log("BinaryExpression is not supported")
        }
      })

      function isConsoleLog(node) {
        return (
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: "console" }) &&
          t.isIdentifier(node.callee.property, { name: "log" })
        )
      }

      if (isConsoleLog(node)) {
        const buildNewFunction = template(`
          %%LOG_FUNCTION_NAME%%(new Function(...%%ARGS%%, %%FUNCTION_BODY%%)(...%%IDENTIFERS%%))
        `)

        const buildNewFunctionNode = buildNewFunction({
          LOG_FUNCTION_NAME,
          ARGS: t.arrayExpression(argn.map((arg) => t.stringLiteral(arg))),
          FUNCTION_BODY: t.stringLiteral("return [" + args.join(", ") + "]"),
          IDENTIFERS: t.arrayExpression(argn.map((arg) => t.identifier(arg)))
        });

        path.replaceWith(buildNewFunctionNode)
      }
    },
  })

  const result = generate(ast)
  console.log(result.code)
  const functionBody = `${result.code} return ${LOG_VARIABLE_NAME}`
  const fn = new Function(functionBody)
  return fn()
}

console.log("output: ", exec(`
  console.log(1 + 2)
`))

// exec(`
//   const x = "hello"
//   const y = "world"
//   console.log("hello")
// `)

// module.exports = exec