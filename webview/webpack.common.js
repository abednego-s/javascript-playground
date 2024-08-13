const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "src", "index.js"),
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "template", "index.html")
    }),
  ],
};