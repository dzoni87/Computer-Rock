const { createFiles } = require('../scripts/createFiles');
const globalVars = require('../helpers/globalVars');
const argv = require('yargs').argv;

const createFile = () => {
	console.log(argv);

	if (argv.t && typeof argv.t === 'string') {
		// create template HBS and JSON files
		createFiles(argv.t.toLowerCase(), 'template');
	} else if (argv.m && typeof argv.m === 'string') {
		// create module HBS and JSON files
		createFiles(argv.m.toLowerCase(), 'module');
	} else {
		globalVars.logMSG(globalVars.warningTemp, 'ERROR: no parameters were passed');
	}
};

createFile();