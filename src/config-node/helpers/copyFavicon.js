
const fs = require('fs');
const globalVars = require('./globalVars');
const path = require('path');
const { root, dist } = require('./paths');
const { startedLog, finishedLog } = require('./logger');

const copyFavicon = () => {
	startedLog('favicon', 'favicon');
	return new Promise((res) => {
		fs.readdirSync(path.join(root, 'src/favicon')).forEach(file => {
			if (globalVars.webFolder) {
				fs.copyFileSync(`./src/favicon/${file}`, `${globalVars.webFolder}/${file}`);
			}
			fs.copyFileSync(path.join(root, `src/favicon/${file}`), path.join(dist, file));
		});

		finishedLog('favicon', 'favicon');
		res();
	});
};

module.exports = {
	copyFavicon
};