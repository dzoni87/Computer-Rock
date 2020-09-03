const fs = require('fs');
const hbsHelpers = require('./helpers');
const globalVars = require('../../helpers/globalVars');
const beautify = require('js-beautify').html;
const handlebars = require('handlebars');
const path = require('path');
const { finishedLog, startedLog } = require('../../helpers/logger');
const { html, dist } = require('../../helpers/paths');

const invalidJSONSet = new Set();
let stop = false;
const message = {
	badJSON: () => {
		console.log('\x1b[41m%s\x1b[30m', 'This .json file is not valid:', '\x1b[0m');
		console.log('\x1b[7m', [...invalidJSONSet][0], '\x1b[0m');
	},
	badHBS: (item) => {
		console.log('\x1b[41m%s\x1b[30m', 'This .hbs file is not valid:', '\x1b[0m');
		console.log('\x1b[7m', item, '\x1b[0m');
	},
	missingJSON: (item) => {
		console.log('\x1b[41m%s\x1b[30m', 'This .json file is missing:', '\x1b[0m');
		console.log('\x1b[7m', item, '\x1b[0m');
	},
	missingHTML: (item) => {
		console.log('\x1b[41m%s\x1b[30m', 'This .html file is missing:', '\x1b[0m');
		console.log('\x1b[7m', item, '\x1b[0m');
	}
};

const hbsConfig = {
	'indent_size': 4,
	'preserve_newlines': false,
	'indent_char': '	'
};

/*----------------------------------------------------------------------------------------------
	HBS
 ----------------------------------------------------------------------------------------------*/

// delete all html files from dist
const deleteFiles = (startPath, filter, resolve)=>{
	if (!fs.existsSync(startPath)) {
		console.log('No dir ', startPath);
		return;
	}

	const files = fs.readdirSync(startPath);
	for (let i = 0; i < files.length; i++) {
		const filename = path.join(startPath, files[i]);
		const stat = fs.lstatSync(filename);
		if (stat.isDirectory()) {
			deleteFiles(filename, filter); //recurse
		} else if (filename.indexOf(filter) >= 0) {
			fs.unlinkSync(filename);
			resolve();
		}
	}
};

const cleanHTML = () => {
	return new Promise((res) => {
		const startPath = dist;
		const filter = '.html';

		deleteFiles(startPath, filter, res);
	});
};

// register all the helpers
const registerHelpers = () => {
	return new Promise((res) => {
		const keys = Object.keys(hbsHelpers);

		keys.forEach(helper => handlebars.registerHelper(helper, hbsHelpers[helper]));

		res();
	});
};

// register all the partials from modules and shared folders
const registerPartials = () => {
	const modules = './src/html/modules/';
	const shared = './src/html/shared/';

	return new Promise((res) => {

		fs.readdirSync(modules).forEach(file => {
			const pathToHbs = modules + file + '/' + file + '.hbs';
			if (!fs.existsSync(pathToHbs)) return;

			const html = fs.readFileSync(pathToHbs, 'utf8');
			handlebars.registerPartial(file, html);
		});

		fs.readdirSync(shared).forEach(file => {
			const pathToHbs = shared + file + '/' + file + '.hbs';
			const html = fs.readFileSync(pathToHbs, 'utf8');
			handlebars.registerPartial(file, html);
		});

		res();
	});
};

const singleLanguageHBS = (inputFiles = []) => {
	stop = false;
	const templates = './src/html/templates';
	const paths = inputFiles;
	const { pageTitle, defaultLanguage } = globalVars;

	return new Promise((res) => {
		if (!inputFiles.length) {
			fromDir(templates, 'data.json', (filename) => {
				const filePath = path.parse(filename);
				if (filePath.base === 'data.json') {
					paths.push(filename);
				}
			});
		}

		// check if all the pats exist
		paths.forEach(p => {
			if (stop) return;

			const jsonPathObject = path.parse(p);
			const filePath = jsonPathObject.dir;
			const htmlPath = filePath + '/template.hbs';

			if (!fs.existsSync(htmlPath)) {
				console.log(`${htmlPath} does not have a .hbs file`);
				stop = true;
				return;
			}

			const html = fs.readFileSync(htmlPath, 'utf8');
			const json = fs.readFileSync(p, 'utf8');

			if (!isJSONValid(json)) {
				invalidJSONSet.add(p);
				message.badJSON();

				stop = true;
				return;
			}

			const data = extendObject(JSON.parse(json));

			if ([...invalidJSONSet].length) {
				message.badJSON();

				stop = true;
				return;
			}

			if (stop) return;

			const h = handlebars.compile(html);

			// move title to data object
			if (data.title) data.data.title = data.title;

			// set page title for corresponding language
			data.data.pageTitle = pageTitle[defaultLanguage];

			// set language in head
			data.data.language = defaultLanguage;

			// set filename
			const fileName = `${data.template}.html`;

			try {
				h(data);
			} catch (e) {
				const { dir, base } = path.parse(htmlPath);
				message.badHBS(dir + path.sep + base);
				stop = true;
				return;
			}

			if (data.class) {
				hbsHelpers.setBodyClass(data.class);
			}

			const rawHTML = h(data);
			const parsedHTML = beautify(rawHTML, hbsConfig);

			writeFile(path.join(dist, fileName), parsedHTML);
			hbsHelpers.setBodyClass('');
		});

		res();

	});
};

const multiLanguageHBS = () => {
	stop = false;
	const templates = path.join(html, 'templates');
	const paths = [];
	const { pageTitle, languages } = globalVars;

	return new Promise((res) => {
		languages.forEach((language) => {
			fromDir(templates, '.hbs', (filename) => {
				const hbsPath = path.parse(path.resolve(filename));
				const dir = hbsPath.dir;
				const pathToJson = `${dir}/${language}.data.json`;

				if (fs.existsSync(pathToJson)) {
					paths.push({
						path: pathToJson,
						language: language
					});
				} else {
					message.missingJSON(pathToJson);
				}
			});
		});

		paths.forEach(p => {
			if (stop) return;

			const jsonPathObject = path.parse(p.path);
			const filePath = jsonPathObject.dir;
			const htmlPath = filePath + '/template.hbs';

			if (!fs.existsSync(htmlPath)) {
				console.log(`${htmlPath} does not have a .hbs file`);
				stop = true;
				return;
			}

			const html = fs.readFileSync(htmlPath, 'utf8');
			const json = fs.readFileSync(p.path, 'utf8');

			if (!isJSONValid(json)) {
				invalidJSONSet.add(p.path);
				message.badJSON();

				stop = true;
				return;
			}

			const data = extendObject(JSON.parse(json));

			if ([...invalidJSONSet].length) {
				message.badJSON();

				stop = true;
				return;
			}

			if (stop) return;

			const h = handlebars.compile(html);

			// move title to data object
			if (data.title) data.data.title = data.title;

			// set page title for corresponding language
			data.data.pageTitle = pageTitle[p.language];

			// set language in head
			data.data.language = p.language;

			// set filename
			const hbsPath = path.parse(path.resolve(p.path));
			const dir = hbsPath.dir;

			let folders = dir.split('templates')[1].split(path.sep);
			folders.pop();
			folders = folders.join(path.sep) + path.sep;
			const fileName = `${p.language}${folders}${data.template}/index.html`;

			try {
				h(data);
			} catch (e) {
				message.badHBS(p);
				stop = true;
				return;
			}

			if (data.class) {
				hbsHelpers.setBodyClass(data.class);
			}

			const rawHTML = h(data);
			const parsedHTML = beautify(rawHTML, hbsConfig);

			writeFile(path.join(dist, fileName), parsedHTML);
			hbsHelpers.setBodyClass(data.class);
		});

		res();
	});
};

const isJSONValid = (json) => {
	try {
		JSON.parse(json);
	} catch (e) {
		return false;
	}
	return true;
};

const extendObject = (object) => {
	const htmlRoot = './src/html/';

	// loop through object
	for (const prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (stop) return object;

			const innerObject = object[prop];
			// extend marker
			const extendKey = '>>';

			// if is extend key
			if (innerObject[extendKey]) {
				let extendedObject = null;
				const url = htmlRoot + innerObject[extendKey];

				// catch if the file is not present
				if (!fs.existsSync(url)) {
					message.missingJSON(innerObject[extendKey]);
					stop = true;
					return;
				} else {
					const extendedObjectData = fs.readFileSync(url, 'utf-8');

					// check if read json is valid
					if (!isJSONValid(extendedObjectData)) {
						invalidJSONSet.add(url);
						stop = true;
						return true;
					}

					extendedObject = JSON.parse(extendedObjectData);
				}

				if (!stop) {
					// check again if extended json has extends
					extendObject(extendedObject);
					object[prop] = extendedObject;
				}
			}

			for (const p in innerObject) {
				if (innerObject.hasOwnProperty(p) && p !== extendKey) {
					object[prop][p] = innerObject[p];

					// check if inner prop has included json
					if (typeof innerObject[p] === 'object') {
						extendObject(innerObject);
					}

					// check if inner prop is a string that contains ${url}
					// for multilanguage links
					if (typeof innerObject[p] === 'string') {
						if (innerObject[p].indexOf('${url}') > -1) {
							innerObject[p] = innerObject[p].replace('${url}', globalVars.path);
						} else if (innerObject[p].slice(-13) === '.content.html') {
							const htmlPath = htmlRoot + innerObject[p];
							if (fs.existsSync(htmlPath)) {
								const html = fs.readFileSync(htmlPath, 'utf8');
								innerObject[p] = html;
							} else {
								message.missingHTML(htmlPath);
								innerObject[p] = '';
							}
						}
					}

					object[prop][p] = innerObject[p];
				}
			}
		}
	}

	return object;
};

const fromDir = (startPath, filter, callback) => {
	if (!fs.existsSync(startPath)) {
		console.log('No dir ', startPath);
		return;
	}

	const files = fs.readdirSync(startPath);
	for (let i = 0; i < files.length; i++) {
		const filename = path.join(startPath, files[i]);
		const stat = fs.lstatSync(filename);
		if (stat.isDirectory()) {
			fromDir(filename, filter, callback); //recurse
		} else if (filename.indexOf(filter) >= 0) callback(filename);
	}
};

const writeFile = (path1, contents, cb = () => {}) => {
	fs.mkdir(path.dirname(path1), { recursive: true }, (err) => {
		if (err) return cb(err);

		fs.writeFile(path1, contents, cb);
	});
};

const hbs = (inputFiles) => {
	startedLog('hbs', 'hbs');
	return new Promise((res) => {
		cleanHTML();
		registerHelpers();
		registerPartials();

		invalidJSONSet.clear();
		if (globalVars.isMultilanguage) {
			multiLanguageHBS();
		} else {
			singleLanguageHBS(inputFiles);
		}

		finishedLog('hbs');
		res();
	});
};

const addLanguage = () => {
	console.log('TO BE IMPLEMENTED');
};

module.exports = {
	hbs, addLanguage
};

// gulp.task('add-lng', (done) => {
// 	const files = './src/html/';

// 	if (!globalVars.isMultilanguage) {
// 		console.log('Multilanguage is off');
// 		done();
// 		return;
// 	}

// 	gulp.src(`${files}**/*.hbs`).pipe(tap((file) => {
// 		fs.readdir(file.dirname, (err) => {
// 			//handling error
// 			if (err) {
// 				return console.log('Unable to scan directory: ' + err);
// 			}

// 			globalVars.languages.forEach(lng => {
// 				if (!fs.existsSync(`${file.dirname}/${lng}.data.json`)) {
// 					fs.copyFile(`${file.dirname}/data.json`, `${file.dirname}/${lng}.data.json`, (err) => {
// 						if (err) throw err;
// 					});
// 				}
// 			});
// 		});
// 	}));

// 	done();
// });
