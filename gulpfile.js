const gulp   = require('gulp');
const concat = require('gulp-concat');
const jshint = require('gulp-jshint');
const del    = require('del');
const os     = require('os');

var paths = {
  scripts: ['conf.priv.js', 'conf.js']
};

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['clean', 'lint'], function() {
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
