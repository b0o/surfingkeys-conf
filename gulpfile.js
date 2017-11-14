const gulp    = require('gulp');
const concat  = require('gulp-concat');
const replace = require('gulp-replace');
const rename  = require('gulp-rename');
const jshint  = require('gulp-jshint');
const del     = require('del');
const os      = require('os');
const { URL } = require('url');
const compl   = require('./completions');

var paths = {
  scripts: ['conf.priv.js', 'completions.js', 'conf.js'],
  gulpfile: ['gulpfile.js'],
  readme: ['README.tmpl.md'],
};

// This notice will be injected into the generated README.md file
const disclaimer = `\
<!--

NOTICE:
This is an automatically generated file - Do not edit it directly.
The source file is README.tmpl.md

-->`;

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('lint', function() {
  return gulp.src([].concat(paths.scripts, paths.gulpfile))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['clean', 'lint', 'readme'], function() {
  return gulp.src(paths.scripts)
    .pipe(concat('.surfingkeys'))
    .pipe(gulp.dest('build'));
});

gulp.task('install', ['build'], function() {
  return gulp.src('build/.surfingkeys')
    .pipe(gulp.dest(os.homedir()));
});

gulp.task('watch', function() {
  gulp.watch([].concat(paths.scripts, paths.gulpfile), ['build']);
  gulp.watch(paths.readme,  ['readme']);
});

gulp.task('readme', function() {
  var table = Object.keys(compl).sort(function(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }).reduce(function(a, k) {
      var c = compl[k];
      var u = new URL(c.search);
      return a + `| \`${c.alias}\` | \`${c.name}\` | \`${u.hostname}\` |\n`;
  }, "");
  return gulp.src(['./README.tmpl.md'])
    .pipe(replace("<!--DISCLAIMER-->", disclaimer))
    .pipe(replace("<!--COMPL_COUNT-->", Object.keys(compl).length))
    .pipe(replace("<!--COMPL_TABLE-->", table))
    .pipe(rename('README.md'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['build']);
