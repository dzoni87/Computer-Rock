const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const webpack = require('webpack-stream');
const webpackConfigDev = require('../../../webpack.config');
const webpackConfigProd = require('../../../webpack.prod.config');
const gulpif = require('gulp-if');
const globalVars = require('./_global-vars');

const destinationFolder = 'dist/js';

/*----------------------------------------------------------------------------------------------
	JS
 ----------------------------------------------------------------------------------------------*/
// task: build javascript
gulp.task('js-task', () => {
	const isProd = globalVars.mode === 'production';
	const webpackConfig = isProd ? webpackConfigProd : webpackConfigDev;

	return gulp.src('src/js/**.js')
		.pipe(plumber())
		.pipe(webpack(webpackConfig))
		.pipe(sourcemaps.write('.'))
		.pipe(gulpif(!!globalVars.webFolder, gulp.dest(`${globalVars.webFolder}/js`)))
		.pipe(gulp.dest(destinationFolder));
});

// task: validate javascript source files
gulp.task('js-lint', () => {
	return gulp.src('src/js/_project/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('js', gulp.series('js-lint', 'js-task'));
