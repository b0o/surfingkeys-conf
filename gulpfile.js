const gulp    = require('gulp');
const concat  = require('gulp-concat');
const replace = require('gulp-replace');
const rename  = require('gulp-rename');
const jshint  = require('gulp-jshint');
const path    = require('path');
const del     = require('del');
const os      = require('os');
const fs      = require('fs');
const spawn   = require('child_process').spawn;
const { URL } = require('url');
const compl   = require('./completions');

var paths = {
  scripts: ['conf.priv.js', 'completions.js', 'conf.js'],
  gulpfile: ['gulpfile.js'],
  readme: ['README.tmpl.md'],
  screenshots: 'assets/screenshots',
};

// This notice will be injected into the generated README.md file
const disclaimer = `\
<!--

NOTICE:
This is an automatically generated file - Do not edit it directly.
The source file is README.tmpl.md

-->`;

gulp.task('gulp-autoreload', function() {
  var p;
  var spawnChildren = function() {
    if (p) p.kill();
    p = spawn('gulp', ['lint-gulpfile', 'install', 'watch-nogulpfile'], {stdio: 'inherit'});
  };
  gulp.watch('gulpfile.js', spawnChildren);
  spawnChildren();
});

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('lint', function() {
  return gulp.src([].concat(paths.scripts, paths.gulpfile))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint-gulpfile', function() {
  return gulp.src([].concat(paths.gulpfile))
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
  gulp.watch([].concat(paths.scripts, paths.gulpfile), ['readme', 'install']);
  gulp.watch(paths.readme,  ['readme']);
});

gulp.task('watch-nogulpfile', function() {
  gulp.watch([].concat(paths.scripts), ['readme', 'install']);
  gulp.watch(paths.readme,  ['readme']);
});

gulp.task('readme', function() {
  var screens = {};
  var screenshotList = "";
  fs.readdirSync(path.join(__dirname, paths.screenshots)).forEach(function(s) {
      var file = path.basename(s, '.png').split('-');
      var alias = file[0];
      if (!screens[alias]) {
          screens[alias] = [];
      }
      screens[alias].push(path.join(paths.screenshots, path.basename(s)));
  });
  var table = Object.keys(compl).sort(function(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }).reduce(function(a, k) {
      var c = compl[k];
      var u = new URL(c.search);
      var domain = (u.hostname === "cse.google.com") ? "Google Custom Search" : u.hostname;
      var s = "";
      if (screens[c.alias]) {
          screens[c.alias].forEach(function(url, i) {
              var num = (i > 0) ? ` ${i+1}` : "";
              s += `[\\[${i+1}\\]](#${c.name}${num.replace(' ', '-')}) `;
              screenshotList += `##### ${c.name}${num}\n`;
              screenshotList += `![${c.name} screenshot](./${url})\n\n`;
          });
      }
      return a + `| \`${c.alias}\` | \`${c.name}\` | \`${domain}\` | ${s} |\n`;
  }, "");
  return gulp.src(['./README.tmpl.md'])
    .pipe(replace("<!--DISCLAIMER-->", disclaimer))
    .pipe(replace("<!--COMPL_COUNT-->", Object.keys(compl).length))
    .pipe(replace("<!--COMPL_TABLE-->", table))
    .pipe(replace("<!--SCREENSHOTS-->", screenshotList))
    .pipe(rename('README.md'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['build']);
