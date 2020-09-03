const postcss = require('postcss');
const sass = require('node-sass');
const stylelint = require('stylelint');
const flexBugsFix = require('postcss-flexbugs-fixes');
const autoprefixer = require('autoprefixer');
const globalVars = require('../../helpers/globalVars');
const fs = require('fs-extra');
const path = require('path');
const { dist, scss, root } = require('../../helpers/paths');
const { makeFolderIfMissing } = require('../../helpers/makeFolderIfMissing');
const { startedLog, finishedLog, errorLog } = require('../../helpers/logger');

// /*----------------------------------------------------------------------------------------------
// SCSS
//  ----------------------------------------------------------------------------------------------*/

const colors = {
	red: (input) => {
		return `\x1b[31m${input}\x1b[0m`;
	},
	orange: (input) => {
		return `\x1b[33m${input}\x1b[0m`;
	}
};

const compileSCSS = () => {
	startedLog('css-c', 'css-task');

	const filePath = path.join(scss, '/layout/_icon-font.scss');
	const outputFolder = path.join(dist, 'css');
	const output = path.join(outputFolder, 'style.min.css');

	return new Promise((res) => {
		makeFolderIfMissing(outputFolder);
		fs.closeSync(fs.openSync(filePath, 'a'));

		sass.render({
			file: path.join(scss, 'style.scss'),
			outFile: output,
			sourceMap: true,
			sourceMapEmbed: true,
			outputStyle: globalVars.mode === 'production' ? 'compressed' : 'expanded',
		}, (err, result) => {
			if (!err) {
				postcss([autoprefixer, flexBugsFix]).process(result.css, { from: undefined, to: path.join(dist, 'css/style3.css') }).then(result => {
					fs.writeFile(output, result.css, (err) => {
						if (err) {
							console.log(err);
						}
						if (!globalVars.webFolder) {
							res();
							finishedLog('css-c');
						}
					});
					if (globalVars.webFolder) {
						const webFolder = path.join(root, globalVars.webFolder, 'css');
						makeFolderIfMissing(webFolder);
						fs.writeFile(path.join(webFolder, 'style.min.css'), result.css, (err) => {
							if (err) {
								console.log(err);
							}
							finishedLog('css-c');
							res();
						});
					}
				});
			} else {
				errorLog('css-c', 'scss complile failed');

				const filePath = path.resolve(err.file);
				const trimmedPath = filePath.replace(path.resolve(scss), 'scss');

				console.log(`\nmessage: ${colors.red(err.message)} \nfile: ${trimmedPath} \nline: ${err.line} \ncolumn: ${err.column}\n`);
				res();
			}
		});
	});

};

const lintSCSS = () => {
	startedLog('css-l', 'css-list');
	return new Promise((res) => {

		stylelint.lint({
			configFile: '.stylelintrc.json',
			files: 'src/scss/**/*.scss',
			fix: true
		})
			.then((data) => {
				const output = stylelint.formatters.string(data.results);

				if (output) console.log(output);
				finishedLog('css-l');
				res(!!output);
			})
			.catch((err) => {
			// do things with err e.g.
				console.error(err.stack);
				finishedLog('css-l');

				res(err.stack);
			});

	});
};

const runSCSS = async() => {
	startedLog('css', 'css');
	const hasLintErrorsOrWarnings = await lintSCSS();

	if (hasLintErrorsOrWarnings) {
		errorLog('css', 'css not compiled, fix lint warnings/errors');
	} else {
		await compileSCSS();
		finishedLog('css');
	}
};

module.exports = {
	compileSCSS, lintSCSS, runSCSS
};