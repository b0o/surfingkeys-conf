const gulp = require("gulp")
const concat = require("gulp-concat")
const replace = require("gulp-replace")
const rename = require("gulp-rename")
const eslint = require("gulp-eslint")
const path = require("path")
const del = require("del")
const os = require("os")
const fs = require("fs")
const { spawn } = require("child_process")
const { URL } = require("url")
const compl = require("./completions")

const paths = {
  scripts:     ["conf.priv.js", "completions.js", "conf.js"],
  gulpfile:    ["gulpfile.js"],
  readme:      ["README.tmpl.md"],
  screenshots: "assets/screenshots",
}

// This notice will be injected into the generated README.md file
const disclaimer = `\
<!--

NOTICE:
This is an automatically generated file - Do not edit it directly.
The source file is README.tmpl.md

-->`

gulp.task("gulp-autoreload", () => {
  let p
  const spawnChildren = function spawnChildren() {
    if (p) p.kill()
    p = spawn("gulp", ["lint-gulpfile", "install", "watch-nogulpfile"], { stdio: "inherit" })
  }
  gulp.watch("gulpfile.js", spawnChildren)
  spawnChildren()
})

gulp.task("clean", () => del(["build"]))

gulp.task("lint", () =>
  gulp
    .src([].concat(paths.scripts, paths.gulpfile))
    .pipe(eslint())
    .pipe(eslint.format()))

gulp.task("lint", () =>
  gulp
    .src(paths.gulpfile)
    .pipe(eslint())
    .pipe(eslint.format()))

gulp.task("build", ["clean", "lint", "readme"], () => gulp.src(paths.scripts)
  .pipe(concat(".surfingkeys"))
  .pipe(gulp.dest("build")))

gulp.task("install", ["build"], () => gulp.src("build/.surfingkeys")
  .pipe(gulp.dest(os.homedir())))

gulp.task("watch", () => {
  gulp.watch([].concat(paths.scripts, paths.gulpfile), ["readme", "install"])
  gulp.watch(paths.readme, ["readme"])
})

gulp.task("watch-nogulpfile", () => {
  gulp.watch([].concat(paths.scripts), ["readme", "install"])
  gulp.watch(paths.readme, ["readme"])
})

gulp.task("readme", () => {
  const screens = {}
  let screenshotList = ""
  fs.readdirSync(path.join(__dirname, paths.screenshots)).forEach((s) => {
    const file = path.basename(s, ".png").split("-")
    const alias = file[0]
    if (!screens[alias]) {
      screens[alias] = []
    }
    screens[alias].push(path.join(paths.screenshots, path.basename(s)))
  })
  const table = Object.keys(compl).sort((a, b) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }).reduce((a, k) => {
    const c = compl[k]
    const u = new URL(c.search)
    const domain = (u.hostname === "cse.google.com") ? "Google Custom Search" : u.hostname
    let s = ""
    if (screens[c.alias]) {
      screens[c.alias].forEach((url, i) => {
        const num = (i > 0) ? ` ${i + 1}` : ""
        s += `[\\[${i + 1}\\]](#${c.name}${num.replace(" ", "-")}) `
        screenshotList += `##### ${c.name}${num}\n`
        screenshotList += `![${c.name} screenshot](./${url})\n\n`
      })
    }
    return `${a}| \`${c.alias}\` | \`${c.name}\` | \`${domain}\` | ${s} |\n`
  }, "")
  return gulp.src(["./README.tmpl.md"])
    .pipe(replace("<!--DISCLAIMER-->", disclaimer))
    .pipe(replace("<!--COMPL_COUNT-->", Object.keys(compl).length))
    .pipe(replace("<!--COMPL_TABLE-->", table))
    .pipe(replace("<!--SCREENSHOTS-->", screenshotList))
    .pipe(rename("README.md"))
    .pipe(gulp.dest("."))
})

gulp.task("default", ["build"])
