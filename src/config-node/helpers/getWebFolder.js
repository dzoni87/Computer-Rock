const fs = require('fs');
const globalVars = require('./globalVars');
const path = require('path');
const { root } = require('../helpers/paths');
const { startedLog, finishedLog } = require('./logger');
//get web folder path

function getWebFolder() {
	startedLog('web', 'get web folder');
	return new Promise((res) => {
		const getDirectories = source => fs.readdirSync(source).filter(name => name.indexOf('.Web') > -1)[0];
		const result = getDirectories(path.join(root, '../'));

		if (result) globalVars.webFolder = `../${result}`;

		finishedLog('web');
		res();
	});
}

module.exports = getWebFolder;