const handleOldNodeVersion = () => {
	let max = 0;
	const text = [
		'Bad node version!',
		`You have: ${process.version}`,
		'You need at least: v12.13.0',
		'use NVM to switch to v12'
	];

	text.forEach(t => { if (t.length > max) max = t.length; });

	console.log('\x1b[41m%s\x1b[30m', ' '.repeat(max + 5), '\x1b[0m');
	console.log('\x1b[41m%s\x1b[30m', ` #${'#'.repeat(max + 2)}#`, '\x1b[0m');
	console.log('\x1b[41m%s\x1b[30m', ` #${' '.repeat(max + 2)}#`, '\x1b[0m');
	text.forEach(t => {
		console.log('\x1b[41m%s\x1b[30m', ` # ${t}${' '.repeat(max - t.length)} #`, '\x1b[0m');
	});
	console.log('\x1b[41m%s\x1b[30m', ` #${' '.repeat(max + 2)}#`, '\x1b[0m');
	console.log('\x1b[41m%s\x1b[30m', ` #${'#'.repeat(max + 2)}#`, '\x1b[0m');
	console.log('\x1b[41m%s\x1b[30m', ' '.repeat(max + 5), '\x1b[0m');
};

module.exports = handleOldNodeVersion;