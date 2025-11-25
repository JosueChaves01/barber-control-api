const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = tsConfig.compilerOptions.baseUrl || './src';
const paths = tsConfig.compilerOptions.paths || {};

tsConfigPaths.register({
  baseUrl,
  paths,
});



