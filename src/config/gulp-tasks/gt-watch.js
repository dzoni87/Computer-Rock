const gulp = require('gulp');
const globalVars = require('./_global-vars');

/*----------------------------------------------------------------------------------------------
	Watch
 ----------------------------------------------------------------------------------------------*/

gulp.task('watch', (done) => {
	// watch .scss files
	gulp.watch(['src/scss/**/*.scss', 'src/html/**/**/*.scss'], gulp.series('css', globalVars.usingGulp));

	// watch .js files
	gulp.watch('src/js/**/*.js', gulp.series('js', globalVars.usingGulp));

	// watch .hbs and .json files
	gulp.watch([
		'src/html/**/*.hbs',
		'src/html/**/*.json',
		'src/html/**/*.content.html'
	], gulp.series('hbs', globalVars.usingGulp));

	done();
});
