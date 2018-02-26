/**
 * Created by Administrator on 2017/6/28.
 */
var path = require('path');
var webpack = require('webpack');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var webpackEntry = require('./webpackEntry');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackMd5Hash = require('webpack-md5-hash');
var  ExtractTextPlugin = require('extract-text-webpack-plugin');
var fs = require('fs')
// var jquery = require('jquery')

var outputDir = "build";
const ENV_TEST = "test";
const ENV_PROD = "dist";

var webpackConfig= {
  devtool: 'source-map',
  entry:webpackEntry.Entry,
  output: {
    filename: '[name].[chunkhash:8].js',
    //异步加载的模块是要以文件形式加载，生成的文件名是以chunkFilename配置的
    chunkFilename: '[name].[chunkhash:8].js',
    path: '',
    publicPath: '../'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.less', '.scss', '.css'],
    modules: [
      path.resolve(__dirname, '../../node_modules'),
      // path.join(__dirname, '../qa')
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
        test: /\.css$/,
        exclude: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ExtractTextPlugin.extract({
          // fallback: 'style-loader',
          use: 'css-loader?modules!postcss-loader'
        })
      },
      {
        test:/\.less$/,
        exclude: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ExtractTextPlugin.extract({
          // fallback: 'style-loader',
          use: 'css-loader?modules!postcss-loader!less-loader'
        })
      },
      {
        test: /\.(sass|scss)$/,
        exclude: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ExtractTextPlugin.extract({
          // fallback: 'style-loader',
          use: 'css-loader?modules!postcss-loader!sass-loader'
        })
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use:  ExtractTextPlugin.extract({
          // fallback: 'style-loader',
          use: 'css-loader!postcss-loader'
        })
      },
      {
        test:/\.less$/,
        include: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ExtractTextPlugin.extract({
          // fallback: 'style-loader',
          use: 'css-loader!postcss-loader!less-loader'
        })
      },
      {
        test: /\.(sass|scss)$/,
        include: [path.resolve(__dirname, '../../src/css'), /node_modules/],
        use: ExtractTextPlugin.extract({
          // fallback: 'style-loader',
          use: 'css-loader!postcss-loader!sass-loader'
        })
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use:'babel-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: ['file-loader']
      },
      {
        test:   /\.(swf|ttf|otf|eot|svg|woff2?)(\?.+)?$/,
        loader: 'url-loader',
        options:  {
          limit: 10000,
          name: 'icons/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new WebpackMd5Hash(),
    new webpack.NoErrorsPlugin(),
    new webpack.BannerPlugin('xsili ' + new Date()),
    new ExtractTextPlugin('[name].[contenthash:8].css'),
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize:256*1024
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks:18
    }),
    new ExtractTextPlugin('[name].[contenthash:8].css'),
    //提供全局的变量，在模块中使用无需用require引入
    new webpack.ProvidePlugin({
      // jQuery: 'jquery',
      // $: 'jquery',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: true
      }
    }),
  ]
};


module.exports = function (env, publicPath) {
  webpackConfig.output.path = path.join(__dirname, `../../${env}`)
  // webpackConfig.output.publicPath = publicPath
  webpackConfig.resolve.modules.push('path.join(__dirname, `../../${env}`)')
  if(env == outputDir + '/' + ENV_TEST) {
    webpackConfig.plugins.push(new webpack.DefinePlugin({
      __DEV__: false,
      __BETA__: false,
      __test__: true,
      __dist__: false,
      "process.env.NODE_ENV" : "'production'"
    }))
  } else {
    webpackConfig.plugins.push(new webpack.DefinePlugin({
      __DEV__: false,
      __BETA__: false,
      __test__: false,
      __dist__: true,
      "process.env.NODE_ENV" : "'production'"
    }))
  }


  for (var key of Object.keys(webpackEntry.htmlTrunk)) {
    let tpl = webpackEntry.htmlTrunk[key]
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      title: tpl.title,
      filename: tpl.filename,
      template: tpl.template,
      hash: false,       // true | false。如果是true，会给所有包含的script和css添加一个唯一的webpack编译hash值。这对于缓存清除非常有用。
      inject: true,     // | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
      chunks: tpl.chunks   // 使用chunks 需要指定entry 入口文件中的哪一个模块
    }))
  }

  return webpackConfig
}

