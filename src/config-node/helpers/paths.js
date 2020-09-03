const finder = require('find-package-json');
const path = require('path');

const packageJsonPath = finder(__dirname).next().filename;
const root = path.parse(packageJsonPath).dir;

module.exports = {
	root,
	assets: path.join(root, 'src/assets'),
	dist: path.join(root, 'dist'),
	scss: path.join(root, 'src/scss'),
	js: path.join(root, 'src/js'),
	html: path.join(root, 'src/html')
};