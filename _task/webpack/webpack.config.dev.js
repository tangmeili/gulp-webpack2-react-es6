/**
 * Created by Administrator on 2017/5/4.
 */
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var webpack = require('webpack');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var path = require('path');
var config = require('rc')('workflow');
var webpackEntry = require('./webpackEntry')
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var outputDir = "build";

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: webpackEntry.Entry,
  output: {
    path: path.join(__dirname, `../../${outputDir}/dev`),
    publicPath: `http://localhost:${config.port}/`,
    filename: "[name].js"
  },
  resolve: {
    extensions: ['.js', '.jsx', '.less', '.scss', '.css'],
    modules: [
      path.resolve(__dirname, '../../node_modules'),
      path.join(__dirname, '../../src')
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'react-hot-loader',
          'babel-loader',
          'jsx-loader?'
        ],
      },
      {
        test: /\.jsx?$/,
        use:'babel-loader'
      },
      {
        test: /\.css$/,
        exclude: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ["style-loader", "css-loader?modules", "postcss-loader"]
      },
      {
        test:/\.less$/,
        exclude: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ["style-loader","css-loader?modules","postcss-loader","less-loader"]
      },
      {
        test: /\.(sass|scss)$/,
        exclude: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ["style-loader", "css-loader?modules", "postcss-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
        test:/\.less$/,
        include: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ["style-loader","css-loader","postcss-loader","less-loader"]
      },
      {
        test: /\.(sass|scss)$/,
        include: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: ['file-loader']
      },
      {
        test:   /\.(swf|ttf|otf|eot|svg|woff|woff2?)(\?.+)?$/,
        loader: "url-loader",
        options:  {
          limit: 10000,
          name: "icons/[name].[ext]"
        }
      }
    ]
  },

  plugins:[
    new LiveReloadPlugin({port:8080}),
    new webpack.HotModuleReplacementPlugin(),
    //提供全局的变量，在模块中使用无需用require引入
    new webpack.ProvidePlugin({
      // jQuery: "jquery",
      // $: "jquery",
    }),
    new webpack.DefinePlugin({
      __DEV__: true,
      __BETA__: false,
      __test__: false,
      __dist__: false,
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,

    }),
    //js文件的压缩
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}

