const { merge } = require("webpack-merge")
const Dotenv = require("dotenv-webpack")
const common = require("./webpack.common.js")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    hot: true,
    historyApiFallback: true,
    port: 8080,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [require.resolve('react-refresh/babel')]
          },
        }
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new ReactRefreshWebpackPlugin()
  ],
}) 