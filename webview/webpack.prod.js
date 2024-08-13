const path = require("path")
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "..", "server", "public", "webview"),
    publicPath: "/",
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: "all",
    },
  },
});
