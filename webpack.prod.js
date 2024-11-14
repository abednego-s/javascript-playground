const path = require("path")
const { merge } = require("webpack-merge")
const common = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const dotenv = require("dotenv")
const { EnvironmentPlugin } = require("webpack")

dotenv.config()

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "public", "web"),
    chunkFilename: '[name].chunk.js',
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new EnvironmentPlugin(["REACT_APP_ENV", "REACT_APP_WS_SERVER"])
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
});
