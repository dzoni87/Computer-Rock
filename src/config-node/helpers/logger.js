require('colors');
const ids = {};

const startedLog = (id, input) => {
	const date = new Date();
	ids[id] = { time: date.getTime(), label: input };

	console.log(`[${date.toLocaleTimeString().grey}] Starting '${input.cyan}'...`);
};

const finishedLog = (id) => {
	const date = new Date();
	const now = date.getTime();
	const duration = `${(now - ids[id].time) / 1000}s`;

	console.log(`[${date.toLocaleTimeString().grey}] Finished '${ids[id].label.cyan}'${duration ? ` after ${duration.magenta}` : '.'}`);
};

const errorLog = (id, errorMessage) => {
	const date = new Date();
	const now = date.getTime();
	const duration = `${(now - ids[id].time) / 1000}s`;

	console.log(`[${date.toLocaleTimeString().grey}] '${ids[id].label.cyan}' ${'errored'.red}${duration ? ` ${'after'.red} ${duration.magenta}` : '.'}`);
	if (errorMessage) console.log(`ERROR!: ${errorMessage.red}`);
};

module.exports = {
	startedLog,
	finishedLog,
	errorLog
};