const webpack = require('webpack');
const webpackConfigDev = require('../../../webpack.config');
const webpackConfigProd = require('../../../webpack.prod.config');
const globalVars = require('../helpers/globalVars');
const { finishedLog, startedLog, errorLog } = require('../helpers/logger');
const path = require('path');
const { dist } = require('../helpers/paths');

const runWebpack = () => {
	startedLog('js', 'js');
	return new Promise((res) => {

		const isProd = globalVars.mode === 'production';
		const webpackConfig = isProd ? webpackConfigProd : webpackConfigDev;

		/* TEMPORARY */
		webpackConfig.output.path = path.join(dist, 'js');

		const compiler = webpack(webpackConfig);

		const config = {
			colors: true,
			performance: false,
			timings: false,
			excludeAssets: true,
			assets: false,
			entrypoints: false,
			modules: false,
			hash: false,
			version: false,
			builtAt: false,
		};

		compiler.run((_, stats) => {
			if (stats.hasErrors()) {
				console.log(stats.toString(config));
				globalVars.buildHasError = true;
				errorLog('js');
			} else if (stats.hasWarnings()) {
				console.log(stats.toString(config));
				finishedLog('js');
			} else {
				finishedLog('js');
			}

			res();
		});
	});
};

module.exports = {
	webpack: runWebpack
};
