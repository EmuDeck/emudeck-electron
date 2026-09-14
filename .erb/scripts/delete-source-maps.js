const path = require('path');
const rimraf = require('rimraf');
const webpackPaths = require('../configs/webpack.paths');

module.exports = function deleteSourceMaps() {
  rimraf.sync(path.join(webpackPaths.distMainPath, '*.js.map'));
  rimraf.sync(path.join(webpackPaths.distRendererPath, '*.js.map'));
};
