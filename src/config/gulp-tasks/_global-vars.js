const fs = require('fs');
const colors = require('colors');

module.exports = {
	mode: 'production', // ["development", "stage", "production"]
	isBeta: false,
	warningTemp: 'src/config/cf-templates/warning-log-temp.txt',

	isMultilanguage: false,
	defaultLanguage: 'en',
	// add your languages here
	languages: ['en'],
	// add page titles for different languages
	pageTitle: {
		en: 'Nikola-test,
	},
	path: '/',

	rf(src, callback) {
		fs.readFile(src, 'utf8', (err, data) => {
			if (!err) {
				callback(data);
			} else {
				console.log('ERROR: ', err);
			}
		});
	},
	logMSG(template, str, color = 'yellow') {
		module.exports.rf(template, (data) => {
			data = data.replace(new RegExp('@{str}', 'g'), str);
			color = color === 'yellow' ? '\x1b[33m' : '\x1b[32m';

			console.log(color);
			console.log(data);
			console.log('\x1b[37m');
		});
	},
	createDistFolder() {
		if (!fs.existsSync('dist')) {
			fs.mkdirSync('./dist');
		}
		if (!fs.existsSync('dist/assets')) {
			fs.mkdirSync('./dist/assets');
		}
		if (!fs.existsSync('dist/assets/images')) {
			fs.mkdirSync('./dist/assets/images');
		}
	},

	usingGulp(done) {
		console.log(`[${'--------'.grey}] ${'Keep in mind that you are using gulp. You should use npm.'.red}`);
		done();
	}
};
