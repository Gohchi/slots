const webpack = require("webpack");
const path = require("path");

// Phaser webpack config
const phaserModule = path.join(__dirname, './node_modules/phaser/');
const phaser = path.join(phaserModule, './src/phaser.js');

module.exports = {
  entry: {
    app: './src/game.js',
    vendor: 'phaser'
  },
  output: {
    // pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: './dist/',
    filename: '[name].bundle.js'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpe?g|gif|svg|xml|mp3)$/i,
        type: 'asset/resource'
      }
    ]
  },
  // optimization: {
  //   splitChunks: {
  //     name: 'vendor',
  //     chunks: 'all'
  //   }
  // },
  plugins: [
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    extensions: ['.js'],
    alias: {
      'phaser': phaser,
    },
    fallback: {
      "buffer": require.resolve("buffer/")
    }
  }
}
