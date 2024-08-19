const { merge } = require("webpack-merge")
const Dotenv = require("dotenv-webpack")
const common = require("./webpack.common.js")

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    hot: true,
    historyApiFallback: true,
    port: 8080
  },
  plugins: [
    new Dotenv()
  ]
}) 