const fs = require('fs');
const globalVars = require('../../helpers/globalVars');
const path = require('path');
const { html, scss } = require('../../helpers/paths');

/*----------------------------------------------------------------------------------------------
	Create/Read/Update Files
 ----------------------------------------------------------------------------------------------*/
const createFiles = (arg, type) => {
	const directory = path.join(html, `/${type}s/${arg}`);

	function create(file, lang) {
		let temp = `${type}-hbs-temp.txt`;
		let filename;

		// detect which file to create
		if (file === 'scss') {
			temp = 'module-scss-temp.txt';
			filename = `_${arg}.scss`;
		} else if (file === 'json') {
			temp = `${type}-json-temp.txt`;
			filename = lang ? lang + '.data.json' : 'data.json';
		} else if (type === 'template') {
			filename = 'template.hbs';
		} else {
			filename = `${arg}.hbs`;
		}

		const readDir = file === 'style' ? path.join(scss, 'style.scss') : path.join(__dirname, `cf-templates/${temp}`);
		let writeDir;

		if (file === 'style') {
			writeDir = path.join(scss, 'style.scss');
		} else if (file === 'scss') {
			writeDir = path.join(scss, `modules/${filename}`);
		} else {
			writeDir = `${directory}/${filename}`;
		}

		globalVars.rf(readDir, (data) => {
			const output = file === 'style' ? (data + `\n@import 'modules/${arg}';`) : data.replace(new RegExp(`@{${type}}`, 'g'), arg);
			fs.writeFileSync(writeDir, output);
		});
	}

	// create if template or module doesn't exists
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory);

		create('hbs');
		if (globalVars.isMultilanguage) {
			globalVars.languages.map(l => {
				create('json', l);
			});
			create('json');
		} else {
			create('json');
		}

		if (type === 'module') {
			create('scss');
			create('style');
		}

		globalVars.logMSG(`src/config/cf-templates/${type}-log-temp.txt`, arg, 'green');
	} else {
		globalVars.logMSG(globalVars.warningTemp, `ERROR: ${type} '${arg}' already exists`);
	}
};

module.exports = {
	createFiles
};