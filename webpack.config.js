'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var srcPath = path.join(__dirname, 'front');

module.exports = {  
  target: 'web',
  cache: true,
  entry: {
    module: ['webpack-hot-middleware/client', 'module'],
    common: ['react', 'react-router', 'alt']
  },
  resolve: {
    root: srcPath,
    extensions: ['','.js','.jsx'],
    modulesDirectories: ['node_modules', 'front']
  },
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '',
    filename: '[name].js',
    library: ['Example', '[name]'],
    pathInfo: true
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel?cacheDirectory'],
        include: path.join(__dirname, 'front') 
      },
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: 'front/index.html'
    }),
    new webpack.NoErrorsPlugin()
  ],

  debug: true,
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    contentBase: './',
    historyApiFallback: true
  }
};
