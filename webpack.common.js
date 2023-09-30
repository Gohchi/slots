const webpack = require("webpack");
const path = require("path");

// Phaser webpack config
const phaserModule = path.join(__dirname, '/node_modules/phaser/');
const phaser = path.join(phaserModule, 'src/phaser.js');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/game.js'),
    vendor: ['phaser']
  },
  output: {
    // pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.[name].js',
    assetModuleFilename: pathData => {
      const filepath = path
        .dirname(pathData.filename)
        .split("/")
        .slice(1)
        .join("/");
      return `${filepath}/[name].[ext][query]`;
    }
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            include: path.join(__dirname, 'src'),
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpe?g|gif|svg|xml|wav|mp3)$/i,
        type: 'asset/resource'
      }
    ]
  },
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
};
