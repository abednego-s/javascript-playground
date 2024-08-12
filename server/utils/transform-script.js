
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
      const contexts = []

      function isConsoleLog(node) {
        return (
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: "console" }) &&
          t.isIdentifier(node.callee.property, { name: "log" })
        )
      }

      function buildArrayExpression(expression) {
        const args = expression.elements.map((element) => {
          if (t.isLiteral(element)) {
            return element.value
          } else if (t.isIdentifier(element)) {
            contexts.push(element.name)
            return element.name
          }
        })
        return `[${args.join(", ")}]`
      }

      function buildBinaryExpression(expression) {
        if (t.isLiteral(expression)) {
          return expression.value
        } else if (t.isIdentifier(expression)) {
          contexts.push(expression.name)
          return expression.name
        } else if (t.isArrayExpression(expression)) {
          return buildArrayExpression(expression)
        } else if (t.isObjectExpression(expression)) {
          return "{}"
        }
      }

      function callExpressionArgumentBuilder(node) {
        const fnName = node.callee.name
        const fnArgs = node.arguments.map((arg) => {
          if (t.isLiteral(arg)) {
            return arg.value
          } else if (t.isIdentifier(arg)) {
            contexts.push(arg.name)
            return arg.name
          } else if (t.isCallExpression(arg)) {
            return callExpressionArgumentBuilder(arg)
          }
        })
        contexts.push(fnName)
        return `${fnName}(${fnArgs.join(", ")})`
      }

      function argumentBuilder() {
        const args = []

        for (let arg of node.arguments) {
          if (t.isCallExpression(arg)) {
            args.push(callExpressionArgumentBuilder(arg))
          } else if (t.isLiteral(arg)) {
            if (t.isStringLiteral(arg)) {
              args.push(`'${arg.value}'`)
            } else {
              args.push(arg.value)
            }
          } else if (t.isBinaryExpression(arg)) {
            const { left, right, operator } = arg
            const expression = `${buildBinaryExpression(left)} ${operator} ${buildBinaryExpression(right)}`
            args.push(expression)
          } else if (t.isIdentifier(arg)) {
            args.push(arg.name)
            contexts.push(arg.name)
          }
        }

        return args.join(", ")
      }

      if (isConsoleLog(node)) {
        const builtArgument = argumentBuilder()
        const buildNewFunction = template(`
          %%LOG_FUNCTION_NAME%%(new Function(...%%ARGS%%, %%FUNCTION_BODY%%)(...%%IDENTIFERS%%))
        `)

        const buildNewFunctionNode = buildNewFunction({
          LOG_FUNCTION_NAME,
          ARGS: t.arrayExpression(contexts.map((arg) => t.stringLiteral(arg))),
          FUNCTION_BODY: t.stringLiteral(`return [${builtArgument}]`),
          IDENTIFERS: t.arrayExpression(contexts.map((arg) => t.identifier(arg)))
        });

        path.replaceWith(buildNewFunctionNode)
      }
    },
  })

  const result = generate(ast)
  const functionBody = `${result.code} return ${LOG_VARIABLE_NAME}`
  const fn = new Function(functionBody)
  return fn()
}

// console.log("output: ", transformScript(`
//   console.log(2 + [1, 2])
// `))

// transformScript(`
//   function foo(x, y) {
//     return x + y
//   }
//   console.log("hello")
// `)

module.exports = transformScript