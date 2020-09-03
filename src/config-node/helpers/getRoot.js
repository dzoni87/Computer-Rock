const finder = require('find-package-json');
const path = require('path');

const packageJsonPath = finder(__dirname).next().filename;
const root = path.parse(packageJsonPath).dir;

module.exports = root;