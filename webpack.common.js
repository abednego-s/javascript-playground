const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const Dotenv = require("dotenv-webpack")

module.exports = {
  entry: path.resolve(__dirname, "web", "index.js"),
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "web", "index.html"),
    }),
    new Dotenv(),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "web"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "web")
    }
  }
};