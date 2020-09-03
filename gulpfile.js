const gulp = require('gulp');
const fs = require('fs-extra');
const globalVars = require('./src/config/gulp-tasks/_global-vars');
require('require-dir')('./src/config/gulp-tasks');

// check for node version
function handleOldNodeVersion(done) {
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

	done();
}

const isCorrectNodeVersion = process.versions.node.split('.')[0] === '12';

// build all files for DEVELOPMENT
const handleDevBuild = (done) => {
	const prepareDev = (done) => {
		globalVars.createDistFolder();
		globalVars.mode = 'development';
		done();
	};

	if (!isCorrectNodeVersion) return handleOldNodeVersion(done);

	return gulp.series(prepareDev, getWebFolder, 'hbs', 'iconfont', 'css', 'js', 'assets', copyFavicon, globalVars.usingGulp)(done);
};

gulp.task('build-dev', handleDevBuild);

// default task, builds everything and then watch
const handleDefault = (done) => {
	const prepareDefault = (done) => {
		globalVars.createDistFolder();
		globalVars.mode = 'development';
		done();
	};

	if (!isCorrectNodeVersion) return handleOldNodeVersion(done);

	return gulp.series(prepareDefault, getWebFolder, 'hbs', 'css', 'js', 'watch')(done);
};

gulp.task('default', handleDefault);

// clear dist folder
gulp.task('reset-dev', (done) => {
	fs.remove('./dist').then(() => {
		console.log('Dist is cleared!');
	}).catch((e) => {
		console.log('Something went wrong:', e.message);
		done();
	}).finally(() => done());
});