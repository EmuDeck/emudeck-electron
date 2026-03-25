/**
 * Webpack config for development electron main process
 */

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const webpackPaths = require('./webpack.paths');

const configuration = {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-main',

  entry: {
    main: path.join(webpackPaths.srcMainPath, 'main.ts'),
    preload: path.join(webpackPaths.srcMainPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.distMainPath,
    filename: '[name].js',
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
};

module.exports = merge(baseConfig, configuration);
