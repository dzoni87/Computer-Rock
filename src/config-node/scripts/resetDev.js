const fs = require('fs-extra');
const { dist } = require('../helpers/paths');
const { startedLog, finishedLog, errorLog } = require('../helpers/logger');

const resetDev = () => {
	startedLog('dist', 'Remove dist');
	return new Promise((res) => {
		fs.remove(dist).then(() => {
			finishedLog('dist');
		}).catch((e) => {
			errorLog('dist', `Something went wrong: ${e.message}`);
		}).finally(() => res());
	});
};

module.exports = { resetDev };