const fs = require('fs-extra');
const path = require('path');
const { assets, dist } = require('../helpers/paths');
const { errorLog, finishedLog, startedLog } = require('../helpers/logger');
const globalVars = require('../helpers/globalVars');

/*----------------------------------------------------------------------------------------------
	Assets Files
 ----------------------------------------------------------------------------------------------*/
const destination = path.join(dist, 'assets');

const copyAssets = () => {
	startedLog('assets', 'assets');
	return new Promise((res) => {
		fs.copy(assets, destination, async(err) => {
			if (err) {
				errorLog('assets', 'An error occured while copying the folder.');
			} else {
				finishedLog('assets');
			}

			if (globalVars.webFolder) {
				startedLog('w-assets', 'webFolder assets');

				fs.copy(assets, globalVars.webFolder, async(err) => {
					if (err) {
						errorLog('w-assets', 'An error occured while copying the folder.');
					} else {
						finishedLog('w-assets');
					}
					res();
				});
			} else {
				res();
			}
		});
	});

};

module.exports = {
	copyAssets
};