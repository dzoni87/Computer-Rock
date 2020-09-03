const globalVars = require('../helpers/globalVars');
const getWebFolder = require('../helpers/getWebFolder');
const { hbs } = require('../scripts/handlebars');
const { webpack: js } = require('../scripts/javascript');
const { finishedLog, startedLog } = require('../helpers/logger');
const { iconfont } = require('../scripts/iconfont');
const { runSCSS } = require('../scripts/scss');
const { copyAssets } = require('../scripts/assets');
const fs = require('fs');
const path = require('path');
const { root, dist } = require('../helpers/paths');
const { copyFavicon } = require('../helpers/copyFavicon');
const { resetDev } = require('../scripts/resetDev');
const getDuration = require('../helpers/getDuration');
const handleOldNodeVersion = require('../helpers/handleOldNodeVersion');

// build all files for DEVELOPMENT
const handleDevBuild = async() => {
	const startTime = new Date().getTime();

	if (!globalVars.isCorrectNodeVersion) return handleOldNodeVersion();

	const prepareStage = () => {
		return new Promise((res) => {

			globalVars.createDistFolder();
			globalVars.mode = 'stage';
			fs.copyFileSync(path.join(root, 'robots.txt'), path.join(dist, 'robots.txt'));

			res();
		});
	};

	startedLog('build-stage', 'stage');

	await resetDev();
	await	prepareStage();
	await getWebFolder();
	await iconfont();
	await runSCSS();
	await js();
	await copyAssets();
	await hbs();
	await copyFavicon();

	finishedLog('build-stage', 'stage');
};

handleDevBuild();