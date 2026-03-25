const fs = require('fs');
const webpackPaths = require('../configs/webpack.paths');

const { srcNodeModulesPath } = webpackPaths;
const { appNodeModulesPath } = webpackPaths;

if (!fs.existsSync(srcNodeModulesPath) && fs.existsSync(appNodeModulesPath)) {
  fs.symlinkSync(appNodeModulesPath, srcNodeModulesPath, 'junction');
}
