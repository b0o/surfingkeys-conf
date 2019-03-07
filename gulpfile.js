const gulp = require("gulp")
const { parallel, series } = require("gulp")
const parcel = require("gulp-parcel")
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
const conf = require("./conf")
const keys = require("./keys")
const util = require("./util")

const paths = {
  scripts:     ["conf.priv.js", "completions.js", "conf.js", "actions.js", "help.js", "keys.js", "util.js"],
  entry:       "conf.js",
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

gulp.task("clean", () => del(["build", ".cache", ".tmp-gulp-compile-*"]))

gulp.task("lint", () => gulp
  .src([].concat(paths.scripts, paths.gulpfile))
  .pipe(eslint())
  .pipe(eslint.format()))

gulp.task("lint-gulpfile", () => gulp
  .src(paths.gulpfile)
  .pipe(eslint())
  .pipe(eslint.format()))

// gulp.task("check-priv", async () => {
//   try {
//     fs.statSync("./conf.priv.js")
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.log("Creating ./conf.priv.js based on ./conf.priv.example.js")
//     fs.copyFileSync("./conf.priv.example.js", "./conf.priv.js", fs.constants.COPYFILE_EXCL)
//   }
// })

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

  const complTable = Object.keys(compl).sort((a, b) => {
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
        s += `[:framed_picture:](#${c.name}${num.replace(" ", "-")}) `
        screenshotList += `##### ${c.name}${num}\n`
        screenshotList += `![${c.name} screenshot](./${url})\n\n`
      })
    }
    return `${a} | \`${c.alias}\` | \`${c.name}\` | \`${domain}\` | ${s} |\n`
  }, "")

  const keysTable = Object.keys(keys.maps).sort((a, b) => {
    if (a === "global") return -1
    if (b === "global") return 1
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }).reduce((acc1, domain) => {
    const header = "<tr><td><strong>Mapping</strong></td><td><strong>Description</strong></td></tr>"
    const c = keys.maps[domain]
    const maps = c.reduce((acc2, map) => {
      let leader = ""
      if (typeof map.leader !== "undefined") {
        leader = map.leader // eslint-disable-line prefer-destructuring
      } else if (domain === "global") {
        leader = ""
      } else {
        leader = conf.siteleader
      }
      const mapStr = util.escape(`${leader}${map.alias}`.replace(" ", "<space>"))
      return `${acc2}<tr><td><code>${mapStr}</code></td><td>${map.description}</td></tr>\n`
    }, "")
    const domainStr = domain === "global" ? "<strong>global</strong>" : `<a href="//${domain}">${domain}</a>`
    return `${acc1}<tr><th colspan="2">${domainStr}</th></tr>${header}\n${maps}`
  }, "")

  return gulp.src(["./README.tmpl.md"])
    .pipe(replace("<!--{{DISCLAIMER}}-->", disclaimer))
    .pipe(replace("<!--{{COMPL_COUNT}}-->", Object.keys(compl).length))
    .pipe(replace("<!--{{COMPL_TABLE}}-->", complTable))
    .pipe(replace("<!--{{KEYS_MAPS_COUNT}}-->", Object.keys(keys.maps).reduce((acc, m) => acc + m.length, 0)))
    .pipe(replace("<!--{{KEYS_SITES_COUNT}}-->", Object.keys(keys.maps).length))
    .pipe(replace("<!--{{KEYS_TABLE}}-->", keysTable))
    .pipe(replace("<!--{{SCREENSHOTS}}-->", screenshotList))
    .pipe(rename("README.md"))
    .pipe(gulp.dest("."))
})

gulp.task("build",
  series(
    parallel(/* "check-priv", */"clean", "lint", "lint-gulpfile", "readme"),
    () => gulp
      .src(paths.entry, { read: false })
      .pipe(parcel())
      .pipe(rename(".surfingkeys"))
      .pipe(gulp.dest("build"))
  ))

gulp.task("install",
  series("build",
    () => gulp.src("build/.surfingkeys").pipe(gulp.dest(os.homedir()))))

gulp.task("watch", () => {
  gulp.watch([].concat(paths.scripts, paths.gulpfile), parallel("install"))
  // gulp.watch(paths.readme, parallel("readme"))
})

gulp.task("watch-nogulpfile", async () => parallel(
  gulp.watch([].concat(paths.scripts), parallel("readme", "install")),
  gulp.watch(paths.readme, parallel("readme"))
))

gulp.task("default", parallel("build"))
