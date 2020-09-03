const chokidar = require('chokidar');
const path = require('path');
const root = require('../helpers/getRoot');
const { webpack } = require('../scripts/javascript');
const { hbs } = require('../scripts/handlebars');
const { runSCSS } = require('../scripts/scss');
const { startedLog } = require('../helpers/logger');
const globalVars = require('../helpers/globalVars');
const fs = require('fs');
const { html } = require('../helpers/paths');

const state = {
	js: {
		isActive: false,
		nextTask: null
	},
	hbs: {
		isActive: false,
		nextTask: null
	},
	scss: {
		isActive: false,
		nextTask: null
	}
};

const walkSync = function(dir, filelist) {
	const files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach((file) => {
		if (fs.statSync(dir + '/' + file).isDirectory()) {
			filelist = walkSync(dir + '/' + file, filelist);
		} else {
			const f = path.parse(file);

			if (f.ext === '.hbs') {
				filelist.push(path.join(dir, file));
			}
		}
	});
	return filelist;
};

const watchFunction = async(state, fn, data) => {
	if (!state.isActive) {
		state.isActive = true;
		await fn(data);
		state.isActive = false;
		if (state.nextTask) {
			await state.nextTask(data);
			state.nextTask = null;
		}
	} else {
		state.nextTask = fn;
	}
};

globalVars.mode = 'development';

startedLog('scss_watch', 'started scss watch');
chokidar.watch(path.join(root, 'src/scss')).on('change', async() => {
	watchFunction(state.scss, runSCSS);
});

startedLog('js_watch', 'started js watch');
chokidar.watch(path.join(root, 'src/js')).on('change', async() => {
	watchFunction(state.js, webpack);
});

startedLog('html_watch', 'started html watch');
chokidar.watch(path.join(root, 'src/html'), {
	awaitWriteFinish: {
		stabilityThreshold: 100,
	}
}).on('change', async(file) => {
	const array = [];

	const parent = path.basename(path.dirname(file));
	const regex = RegExp(`{{> ${parent}`, 'm');

	if (file.includes('templates')) {
		array.push(file.replace('template.hbs', 'data.json'));
	} else if (file.includes('modules') || file.includes('shared')) {
		const files = walkSync(html);

		files.forEach(f => {
			const readFile = fs.readFileSync(f, { encoding: 'utf-8' });

			if (regex.test(readFile)) {
				array.push(f.replace('template.hbs', 'data.json'));
			}
		});
	}

	watchFunction(state.hbs, hbs, array);
});