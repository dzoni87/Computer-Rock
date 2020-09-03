const fs = require('fs');
const path = require('path');
const svgo = require('svgo');
const globalVars = require('../../helpers/globalVars');
const { startedLog, errorLog, finishedLog } = require('../../helpers/logger');

/*----------------------------------------------------------------------------------------------
	SVGs / IconFont
----------------------------------------------------------------------------------------------*/
// SVG optimization
const svgPath = 'src/assets/svg';
const svgomg = new svgo({
	plugins: [
		{ cleanupAttrs: true },
		{ removeDoctype: true },
		{ removeXMLProcInst: true },
		{ removeComments: true },
		{ removeMetadata: true },
		{ removeTitle: true },
		{ removeDesc: true },
		{ removeUselessDefs: true },
		{ removeEditorsNSData: true },
		{ removeEmptyAttrs: true },
		{ removeHiddenElems: true },
		{ removeEmptyText: true },
		{ removeEmptyContainers: true },
		{ removeViewBox: false },
		{ cleanupEnableBackground: true },
		{ convertStyleToAttrs: true },
		{ convertColors: true },
		{ convertPathData: {
			noSpaceAfterFlags: false
		} },
		{ convertTransform: true },
		{ removeUnknownsAndDefaults: true },
		{ removeNonInheritableGroupAttrs: true },
		{ removeUselessStrokeAndFill: true },
		{ removeUnusedNS: true },
		{ cleanupIDs: true },
		{ cleanupNumericValues: true },
		{ moveElemsAttrsToGroup: true },
		{ moveGroupAttrsToElems: true },
		{ collapseGroups: true },
		{ removeRasterImages: false },
		{ mergePaths: true },
		{ convertShapeToPath: true },
		{ sortAttrs: true },
		{ removeDimensions: true },
		{ removeAttrs: { attrs: '(stroke|fill)' } },
		{
			addAttributesToSVGElement: {
				attributes: ['fill="currentColor"']
			}
		}
	]
});
const optimizeSVGsArray = [];

const renameSvgFiles = (file, filePath, allFiles) => {
	return new Promise((resolve) => {
		globalVars.rf(filePath, () => {
			let newFile;

			if (file.substring(0, 4) !== 'ico-') {
				newFile = file.toLowerCase();
				newFile = newFile.toLowerCase();
				newFile = newFile.replace('.svg', '').replace(/-/g, ' ').replace(/[^\w\s]/gi, '').replace(/ /g, '-');
				newFile = `ico-${newFile}.svg`;

				if (allFiles.includes(newFile)) {
					// delete file if already exists
					try {
						fs.unlinkSync(filePath);
						globalVars.logMSG(globalVars.warningTemp, `deleted '${filePath}' as file with same name already exists`);
					} catch (err) {
						console.log(err);
					}
				} else {
					// rename file
					fs.renameSync(filePath, path.join(svgPath, newFile));
				}
			} else {
				newFile = file;
			}

			resolve(newFile);
		});
	});
};

const optimizeSvgFiles = (filePath) => {
	return new Promise((resolve) => {
		globalVars.rf(filePath, (data) => {
			resolve(svgomg.optimize(data, { path: filePath }));
		});
	});
};

const saveSvgFiles = (filepath, data) => {
	return new Promise((resolve) => {
		fs.writeFile(filepath, data, err => {
			if (err) throw err;
			resolve(filepath);
		});
	});
};

const optimizeSVGs = () => {
	startedLog('optimize-svg', 'optimize-svgs');
	return new Promise((res) => {

		fs.readdirSync(svgPath).forEach((file, i, allFiles) => {
			const filePath = path.join(svgPath, file);

			// remove non svg files from folder
			if (path.extname(file) !== '.svg') {
				try {
					fs.unlinkSync(filePath);
					globalVars.logMSG(globalVars.warningTemp, `deleted '${filePath}' as it is not an SVG file`);
				} catch (err) {
					console.log(err);
				}
			} else {
			// svgo optimization
				const optimizeSVG = optimizeSvgFiles(filePath)
					.then(result => {
					// save optimized file
						return saveSvgFiles(filePath, result.data);
					})
					.then(() => {
					// clean file name and prefix it
						return renameSvgFiles(file, filePath, allFiles);
					});

				// store all optimization Promise functions
				optimizeSVGsArray.push(optimizeSVG);
			}
		});

		// build font icons when all optimization functions are done
		Promise.all(optimizeSVGsArray).then(() => {
			finishedLog('optimize-svg');
			res();
		}).catch(error => {
			errorLog('optimize-svg', error);
		});
	});
};

module.exports = {
	optimizeSVGs
};