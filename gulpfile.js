/**
 * Expose commands with gulp for use by WebStorm
 *
 */
var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('publish', function() {
  var ghPages = require('gulp-gh-pages');
  return gulp.src('./build/web/**/*')
    .pipe(ghPages());
});



