const path = require('path');
const fs = require('fs-extra');
const {
	createSVG,
	createTTF,
	createWOFF,
	createWOFF2,
	copyTemplate,
} = require('svgtofont/lib/utils');
const { finishedLog, startedLog, errorLog } = require('../../helpers/logger');
const { dist, root, assets } = require('../../helpers/paths');
const { makeFolderIfMissing } = require('../../helpers/makeFolderIfMissing');
const globalVars = require('../../helpers/globalVars');
const { optimizeSVGs } = require('./optimizeSvgs');

const SVG_PATH = path.resolve(root, 'src/assets/svg');
const FONT_OUTPUT_PATH = path.join(dist, 'assets/fonts');
const SCSS_OUTPUT_PATH = path.resolve(root, 'src/scss/layout');

const item = (name, code) => {
	return `	@if $filename == ${name} {
		$char: '\\${code}';
	}\n`;
};

const item2 = (prefix, name) => {
	return `.${prefix}-${name} {
	@include font(${name});
}\n`;
};

const options = {
	src: SVG_PATH, // svg path
	dist: FONT_OUTPUT_PATH, // output path
	cssDist: SCSS_OUTPUT_PATH,
	fontName: 'svgicons', // font name
	css: true, // Create CSS files.
	startNumber: 20000, // unicode start number
	svgicons2svgfont: {
		fontHeight: 1000,
		normalize: true
	},
	classNamePrefix: 'font'
};

const cssString = [];
const cssString2 = [];

const buildIcons = async() => {
	makeFolderIfMissing(FONT_OUTPUT_PATH);
	const unicodeObject = await createSVG(options);

	Object.keys(unicodeObject).forEach(name => {
		const _code = unicodeObject[name];

		cssString.push(item(name, _code.charCodeAt(0).toString(16).toUpperCase()));
		cssString2.push(item2(options.classNamePrefix, name));
	});

	const ttf = await createTTF(options); // SVG Font => TTF
	await createWOFF(options, ttf); // TTF => WOFF
	await createWOFF2(options, ttf); // TTF => WOFF2

	if (options.css) {
		const fontTemp = path.resolve(__dirname, 'template');
		return copyTemplate(fontTemp, options.cssDist, {
			fontname: options.fontName,
			cssString: cssString.join(''),
			cssString2: cssString2.join(''),
			timestamp: new Date().getTime(),
			output: '../assets/fonts'
		});
	}

	return;
};

const copyFontsToWebFolder = () => {
	return new Promise((res) => {
		if (!globalVars.webFolder) res();

		startedLog('iconfont-copy', 'fonts-to-web');
		const fonts = path.join(assets, 'fonts');
		const destination = path.join(dist, 'assets/fonts');

		fs.copy(fonts, destination, async(err) => {
			if (err) {
				errorLog('iconfont-copy', 'An error occured while copying the folder.');
			} else {
				finishedLog('iconfont-copy');
			}
			res();
		});
	});
};

const iconfont = async() => {
	startedLog('iconfont', 'iconfont');
	await optimizeSVGs();
	await buildIcons();
	await copyFontsToWebFolder();
	finishedLog('iconfont');
};

module.exports = {
	iconfont
};