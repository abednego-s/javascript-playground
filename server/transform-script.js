
const { parseSync } = require("@babel/core");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types")
const generate = require("@babel/generator").default;
const template = require("@babel/template").default;

const LOG_VARIABLE_NAME = "JSPlaygroundLog"
const LOG_FUNCTION_NAME = "JSPlaygroundConsoleLog"

function transformScript(script) {
  const ast = parseSync(script)

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

      function isConsoleLog(node) {
        return (
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: "console" }) &&
          t.isIdentifier(node.callee.property, { name: "log" })
        )
      }

      if (isConsoleLog(node)) {
        const args = []
        const argn = []

        function buildArrayExpression(expression) {
          let _arguments = []
          expression.elements.forEach((element) => {
            if (t.isLiteral(element)) {
              _arguments.push(element.value)
            } else if (t.isIdentifier(element)) {
              _arguments.push(element.name)
              argn.push(element.name)
            }
          })
          return `[${_arguments.join(", ")}]`
        }

        function buildBinaryExpression(expression) {
          if (t.isLiteral(expression)) {
            return expression.value
          } else if (t.isIdentifier(expression)) {
            argn.push(expression.name)
            return expression.name
          } else if (t.isArrayExpression(expression)) {
            return buildArrayExpression(expression)
          } else if (t.isObjectExpression(expression)) {
            return "{}"
          }
        }

        node.arguments.forEach((arg) => {
          if (t.isLiteral(arg)) {
            if (t.isStringLiteral(arg)) {
              args.push(`'${arg.value}'`)
            } else {
              args.push(arg.value)
            }
          } else if (t.isIdentifier(arg)) {
            args.push(arg.name)
            argn.push(arg.name)
          } else if (t.isCallExpression(arg)) {
            args.push(arg.callee.name + "()")
            argn.push(arg.callee.name)
          } else if (t.isBinaryExpression(arg)) {
            const { left, right, operator } = arg
            const expression = `${buildBinaryExpression(left)} ${operator} ${buildBinaryExpression(right)}`
            args.push(expression)
          }
        })

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
  // console.log(result.code)
  const functionBody = `${result.code} return ${LOG_VARIABLE_NAME}`
  const fn = new Function(functionBody)
  return fn()
}

// console.log("output: ", transformScript(`
//   console.log(1 + true)
// `))

// transformScript(`
//   const x = "hello"
//   const y = "world"
//   console.log("hello")
// `)

module.exports = transformScript