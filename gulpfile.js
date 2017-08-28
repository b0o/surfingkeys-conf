var gulp   = require('gulp');
var concat = require('gulp-concat');
var del    = require('del');
var os     = require('os');


var paths = {
  scripts: ['conf.priv.js', 'conf.js']
};

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('build', ['clean'], function() {
  return gulp.src(paths.scripts)
    .pipe(concat('.surfingkeys'))
    .pipe(gulp.dest('build'));
});

gulp.task('install', ['build'], function() {
  return gulp.src('build/.surfingkeys')
    .pipe(gulp.dest(os.homedir()));
})

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['build']);
});

gulp.task('default', ['build']);
