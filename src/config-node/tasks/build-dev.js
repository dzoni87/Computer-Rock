const globalVars = require('../helpers/globalVars');
const handleOldNodeVersion = require('../helpers/handleOldNodeVersion');

if (!globalVars.isCorrectNodeVersion) return handleOldNodeVersion();

const getWebFolder = require('../helpers/getWebFolder');
const { hbs } = require('../scripts/handlebars');
const { webpack: js } = require('../scripts/javascript');
const { finishedLog, startedLog, errorLog } = require('../helpers/logger');
const { iconfont } = require('../scripts/iconfont');
const { runSCSS } = require('../scripts/scss');
const { copyAssets } = require('../scripts/assets');
const { copyFavicon } = require('../helpers/copyFavicon');
const { resetDev } = require('../scripts/resetDev');

async function run() {
	for (let i = 0; i < arguments.length; i++) {
		if (globalVars.buildHasError) return;

		await arguments[i]();
	}
}

// build all files for DEVELOPMENT
const handleDevBuild = async() => {

	const prepareDev = () => {
		startedLog('prep-dev', 'preparation');
		return new Promise((res) => {
			globalVars.createDistFolder();
			globalVars.mode = 'development';
			finishedLog('prep-dev');
			res();
		});
	};

	startedLog('dev', 'build-dev');

	await run(
		resetDev,
		prepareDev,
		getWebFolder,
		iconfont,
		runSCSS,
		js,
		copyAssets,
		hbs,
		copyFavicon
	);

	// await resetDev();
	// await	prepareDev();
	// await getWebFolder();
	// await iconfont();
	// await runSCSS();
	// await js();
	// await copyAssets();
	// await hbs();
	// await copyFavicon();

	if (globalVars.buildHasError) {
		errorLog('dev', '?');
	} else {
		finishedLog('dev');
	}
};

handleDevBuild();