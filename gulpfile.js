const gulp = require("gulp")
const { parallel, series } = require("gulp")
const parcel = require("gulp-parcel")
const replace = require("gulp-replace")
const rename = require("gulp-rename")
const eslint = require("gulp-eslint")
const file = require("gulp-file")
const path = require("path")
const del = require("del")
const os = require("os")
const fs = require("fs").promises
const fetch = require("node-fetch")
const { spawn } = require("child_process")
const { URL } = require("url")

let srcFilesLoaded = false
let compl
let conf
let keys
let util

const requireSrcFiles = () => {
  if (srcFilesLoaded) {
    return
  }
  compl = require("./completions") // eslint-disable-line global-require
  conf = require("./conf") // eslint-disable-line global-require
  keys = require("./keys") // eslint-disable-line global-require
  util = require("./util") // eslint-disable-line global-require
  srcFilesLoaded = true
}

const paths = {
  scripts:     ["conf.priv.js", "completions.js", "conf.js", "actions.js", "help.js", "keys.js", "util.js"],
  entry:       "conf.js",
  gulpfile:    ["gulpfile.js"],
  readme:      ["README.tmpl.md"],
  assets:      "assets",
  screenshots: "assets/screenshots",
  favicons:    "assets/favicons",
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

gulp.task("clean-favicons", () => del([paths.favicons]))

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

gulp.task("docs", parallel(async () => {
  requireSrcFiles()

  const screens = {}
  let screenshotList = ""

  const screenshots = await fs.readdir(path.join(__dirname, paths.screenshots))
  screenshots.forEach((s) => {
    const name = path.basename(s, ".png").split("-")
    const alias = name[0]
    if (!screens[alias]) {
      screens[alias] = []
    }
    screens[alias].push(path.join(paths.screenshots, path.basename(s)))
  })

  let complTable = Object.keys(compl).sort((a, b) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  let keysTable = Object.keys(keys.maps).sort((a, b) => {
    if (a === "global") return -1
    if (b === "global") return 1
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  complTable = await complTable.reduce(async (acc1p, k) => {
    const acc1 = await acc1p
    const c = compl[k]
    const u = new URL(c.domain ? `https://${c.domain}` : c.search)
    // const domain = (u.hostname === "cse.google.com") ? "Google Custom Search" : u.hostname
    const domain = u.hostname
    let s = ""
    if (screens[c.alias]) {
      screens[c.alias].forEach((url, i) => {
        const num = (i > 0) ? ` ${i + 1}` : ""
        s += `<a href="#${c.name}${num.replace(" ", "-")}">:framed_picture:</a>`
        screenshotList += `##### ${c.name}${num}\n`
        screenshotList += `![${c.name} screenshot](./${url})\n\n`
      })
    }
    const faviconExt = c.favicon ? path.extname(new URL(c.favicon).pathname) : ".ico"
    const favicon = `<img src="./assets/favicons/${u.hostname}${faviconExt}" width="16px"> `
    return `${acc1}
  <tr>
    <td><a href="${u.protocol}//${domain}">${favicon}</a></td>
    <td><code>${c.alias}</code></td>
    <td>${c.name}</td>
    <td><a href="${u.protocol}//${domain}">${domain}</a></td>
    <td>${s}</td>
  </tr>`
  }, Promise.resolve(""))

  keysTable = await keysTable.reduce(async (acc1p, domain) => {
    const acc1 = await acc1p
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
    let domainStr = "<strong>global</strong>"
    const favicon = `<img src="./assets/favicons/${domain}.ico" width="16px"> `
    if (domain !== "global") {
      domainStr = `<a href="//${domain}">${favicon}${domain}</a>`
    }
    return `${acc1}<tr><th colspan="2">${domainStr}</th></tr>${header}\n${maps}`
  }, Promise.resolve(""))

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
}))

const getFavicon = async ({ domain, favicon }, timeout = 5000) => {
  // const url = `https://${domain}/favicon.ico`
  const url = favicon
  // const ico = await fetch(
  let data
  const ext = path.extname(new URL(favicon).pathname)
  try {
    const res = await fetch(url, { timeout })
    if (!res.ok) {
      throw new Error(`request to ${url} failed with code ${res.status}`)
    }
    data = await res.buffer()
  } catch (e) {
    process.stdout.write(`no favicon found for ${url}: ${e}\n`)
    // transparent pixel
    data = Buffer.from(
      "AAABAAEAAQEAAAEAIAAwAAAAFgAAACgAAAABAAAAAgAAAAEAIAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA==",
      "base64"
    )
  }
  return {
    name:   `${domain}${ext}`,
    source: data,
  }
}

gulp.task("favicons", series("clean-favicons", async () => {
  requireSrcFiles()

  const sites = [].concat(
    // search engine completions
    Object.entries(compl)
      .map(([, v]) => ({
        domain:  new URL(v.domain ? `https://${v.domain}` : v.search).hostname,
        favicon: v.favicon ? v.favicon : `${new URL(v.domain ? `https://${v.domain}` : v.search).origin}/favicon.ico`,
      })),

    // site-specific keybindings
    Object.keys(keys.maps)
      .filter(k => k !== "global")
      .map(k => ({
        domain:  k,
        favicon: `${new URL(`https://${k}`).origin}/favicon.ico`,
      })),
  )
    .filter((e, i, arr) => i === arr.indexOf(e)) // Keep only first occurrence of each element

  const favicons = (await Promise.all(sites.map(async site => getFavicon(site))))
    .filter(e => e !== undefined)
  return file(favicons, { src: true })
    .pipe(gulp.dest(paths.favicons))
}))

gulp.task("docs-full", parallel("docs", "favicons"))

gulp.task("build",
  series(
    parallel(/* "check-priv", */"clean"),
    parallel("lint", "lint-gulpfile", () => gulp
      .src(paths.entry, { read: false })
      .pipe(parcel())
      .pipe(rename(".surfingkeys"))
      .pipe(gulp.dest("build")))
  ))

gulp.task("dist", parallel("docs-full", "build"))

gulp.task("install",
  series("build",
    () => gulp.src("build/.surfingkeys").pipe(gulp.dest(os.homedir()))))

gulp.task("watch", () => {
  gulp.watch([].concat(paths.scripts, paths.gulpfile), parallel("install"))
})

gulp.task("watch-nogulpfile", async () => parallel(
  gulp.watch([].concat(paths.scripts), parallel("docs", "install")),
  gulp.watch(paths.readme, parallel("docs"))
))

gulp.task("default", parallel("build"))
