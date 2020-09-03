const globalVars = require('../helpers/globalVars');
const getWebFolder = require('../helpers/getWebFolder');
const { hbs } = require('../scripts/handlebars');
const { webpack: js } = require('../scripts/javascript');
const { finishedLog, startedLog } = require('../helpers/logger');
const { iconfont } = require('../scripts/iconfont');
const { runSCSS } = require('../scripts/scss');
const { copyAssets } = require('../scripts/assets');
const { copyFavicon } = require('../helpers/copyFavicon');
const { resetDev } = require('../scripts/resetDev');
const handleOldNodeVersion = require('../helpers/handleOldNodeVersion');

// build all files for DEVELOPMENT
const handleDevBuild = async() => {

	if (!globalVars.isCorrectNodeVersion) return handleOldNodeVersion();

	const prepareProd = () => {
		return new Promise((res) => {

			globalVars.createDistFolder();
			globalVars.isBeta = false;
			globalVars.mode = 'production';
			res();
		});
	};

	startedLog('build-prod', 'prod');

	await resetDev();
	await	prepareProd();
	await getWebFolder();
	await iconfont();
	await runSCSS();
	await js();
	await copyAssets();
	await hbs();
	await copyFavicon();

	finishedLog('build-prod', 'prod');
};

handleDevBuild();