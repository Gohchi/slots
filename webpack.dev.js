const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  WEBGL_RENDERER: true, 
  CANVAS_RENDERER: true 
});

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    // static: {
    //   directory: path.join(__dirname, 'public'),
    // },
    // compress: true,
    // port: 3000,
  },
  plugins: [
    definePlugin,
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.webpack.html',
      chunks: ['vendor', 'app'],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: false,
        collapseWhitespace: false,
        html5: false,
        minifyCSS: false,
        minifyJS: false,
        minifyURLs: false,
        removeComments: false,
        removeEmptyAttributes: false
      },
      hash: false
    }),
  ]
})