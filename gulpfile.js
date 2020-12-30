const gulp = require("gulp")

const { task, src, dest } = gulp
const { parallel, series } = gulp

const webpack = require("webpack")
const webpackStream = require("webpack-stream")

const replace = require("gulp-replace")
const rename = require("gulp-rename")
const eslint = require("gulp-eslint")
const file = require("gulp-file")
const path = require("path")
const del = require("del")
const platforms = require("platform-folders")
const fs = require("fs").promises
const fetch = require("node-fetch")
const express = require("express")
const gulpIf = require("gulp-if")
const gulpNotify = require("gulp-notify")
const PluginError = require("plugin-error")

const { COPYFILE_EXCL } = require("fs").constants
const { URL } = require("url")

const pkg = require("./package.json")
const webpackConfig = require("./webpack.config.js")

const copyrightYearOne = 2017

const paths = {
  scripts:          ["conf.priv.js", "completions.js", "conf.js", "actions.js", "help.js", "keys.js", "util.js"],
  entry:            "conf.js",
  gulpfile:         "gulpfile.js",
  readme:           "README.tmpl.md",
  assets:           "assets",
  screenshots:      "assets/screenshots",
  favicons:         "assets/favicons",
  faviconsManifest: "favicons.json",
  readmeOut:        "README.md",
  scriptOut:        "surfingkeys.js",
  buildDir:         "build/",
  installDir:       platforms.getConfigHome(),
}

let srcFilesLoaded = false
let compl
let conf
let keys
let util

const requireSrcFiles = () => {
  if (srcFilesLoaded) {
    return
  }
  /* eslint-disable global-require, import/no-dynamic-require */
  compl = require("./completions")
  conf = require("./conf")
  keys = require("./keys")
  util = require("./util")
  /* eslint-enable global-require, import/no-dynamic-require */
  srcFilesLoaded = true
}

let faviconsManifest
const loadFaviconsManifest = async () => {
  if (typeof faviconsManifest === "object" && Object.keys(faviconsManifest).length > 0) {
    return
  }
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    faviconsManifest = require(`./${path.join(paths.favicons, paths.faviconsManifest)}`)
  } catch (e) {
    console.log(`Warning: couldn't load favicons manifest: ${e}`) // eslint-disable-line no-console
    faviconsManifest = {}
  }
}

const servePort = 9919

// This notice will be injected into the generated README.md file
const disclaimer = `\
<!--

NOTICE:
This is an automatically generated file - Do not edit it directly.
The source file is ${paths.readme}

-->`

const notify = Object.assign((opts, ...args) => gulpNotify({
  icon:    null,
  onLast:  true,
  timeout: 2000,
  ...opts,
}, ...args), gulpNotify)

notify.onError = (opts, ...args) => gulpNotify.onError({
  onLast:  true,
  timeout: 7500,
  ...opts,
}, ...args)

task("clean", () => del(["build", ".cache", ".tmp-gulp-compile-*"]))
task("clean-favicons", () => del([paths.favicons]))

const lint = (globs, opts = {}) => gulp.src(globs)
  .pipe(eslint(opts))
  .pipe(eslint.format())
  .pipe(eslint.results((res) => {
    if (res.warningCount + res.errorCount > 0) {
      const msg = []
      if (res.warningCount > 0) {
        msg.push(`${res.warningCount} warning${res.warningCount === 1 ? "" : "s"}`)
      }
      if (res.errorCount > 0) {
        msg.push(`${res.errorCount} error${res.errorCount === 1 ? "" : "s"}`)
      }
      const numBadFiles = res.reduce((acc, e) =>
        (e.errorCount + e.warningCount > 0 ? acc + 1 : acc),
      0)
      const err = new PluginError("gulp-eslint", {
        name:    "ESLintError",
        message: `${msg.join(" and ")} in ${numBadFiles} file${numBadFiles === 1 ? "" : "s"}`,
      })
      notify.onError({
        title:   `Lint failure [${pkg.name}]`,
        message: err.message,
      })(err)
      throw err
    }
  }))

task("lint", () => lint([...paths.scripts, paths.gulpfile]))

task("lint-fix", () => lint([...paths.scripts, paths.gulpfile], { fix: true })
  .pipe(gulpIf(
    (f) => f.eslint !== undefined && f.eslint.fixed === true,
    gulp.dest((f) => f.base),
  )))

task("check-priv", async () => {
  try {
    await fs.stat("./conf.priv.js")
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("Notice: Initializing ./conf.priv.js - configure your API keys here.")
    return fs.copyFile("./conf.priv.example.js", "./conf.priv.js", COPYFILE_EXCL)
  }
  return Promise.resolve()
})

const parseContributor = (contributor) => {
  let c = contributor
  if (typeof contributor === "string") {
    const m = contributor.match(/^(?<name>.*?)\s*(<(?<email>.*?)>)?\s*(\((?<url>.*?)\))?$/)
    if (!m) {
      throw new Error(`couldn't parse contributor '${contributor}'`)
    }
    c = m.groups
  } else if (typeof contributor !== "object") {
    throw new Error(`expected contributor to be of type 'string' or 'object', got '${typeof contributor}'`)
  }
  if (!c.name) {
    return null
  }
  return `${c.url ? `<a href="${c.url}">` : ""}${c.name}${c.url ? "</a>" : ""}`
}

task("docs", parallel(async () => {
  requireSrcFiles()
  await loadFaviconsManifest()

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

    const favicon = faviconsManifest[domain] ? `<img src="./assets/favicons/${faviconsManifest[domain]}" width="16px"> ` : ""

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
    let favicon = ""
    if (domain !== "global") {
      favicon = faviconsManifest[domain] ? `<img src="./assets/favicons/${faviconsManifest[domain]}" width="16px"> ` : ""
      domainStr = `<a href="//${domain}">${favicon}${domain}</a>`
    }
    return `${acc1}<tr><th colspan="2">${domainStr}</th></tr>${header}\n${maps}`
  }, Promise.resolve(""))

  const year = (new Date()).getFullYear()
  const copyrightYears = `${copyrightYearOne !== year ? `${copyrightYearOne}-${year}` : copyrightYearOne}`
  let copyright = `<p><h4>Author</h4>&copy; ${copyrightYears} ${parseContributor(pkg.author)}</p>`
  if (Array.isArray(pkg.contributors) && pkg.contributors.length > 0) {
    copyright += "<p><h4>Contributors</h4><ul>"
    copyright += pkg.contributors.reduce((acc, c) => `${acc}<li>${parseContributor(c)}</li>`, "")
    copyright += "</ul></p>"
  }
  copyright += `<p><h4>License</h4>Released under the <a href="./LICENSE">${pkg.license} License</a></p>`

  return src([paths.readme])
    .pipe(replace("<!--{{DISCLAIMER}}-->", disclaimer))
    .pipe(replace("<!--{{COMPL_COUNT}}-->", Object.keys(compl).length))
    .pipe(replace("<!--{{COMPL_TABLE}}-->", complTable))
    .pipe(replace("<!--{{KEYS_MAPS_COUNT}}-->", Object.values(keys.maps).reduce((acc, m) => acc + m.length, 0)))
    .pipe(replace("<!--{{KEYS_SITES_COUNT}}-->", Object.keys(keys.maps).length))
    .pipe(replace("<!--{{KEYS_TABLE}}-->", keysTable))
    .pipe(replace("<!--{{SCREENSHOTS}}-->", screenshotList))
    .pipe(replace("<!--{{COPYRIGHT}}-->", copyright))
    .pipe(rename(paths.readmeOut))
    .pipe(dest("."))
}))

const getFavicon = async ({ domain, favicon }, timeout = 5000) => {
  const url = favicon
  let data
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
      "base64",
    )
  }
  return {
    domain,
    name:   `${domain}.ico`,
    source: data,
  }
}

task("favicons", series("clean-favicons", async () => {
  requireSrcFiles()

  const sites = [].concat(
    // search engine completions
    Object.entries(compl)
      .map(([, v]) => ({
        domain:  new URL(v.domain ? `https://${v.domain}` : v.search).hostname,
        favicon: `https://icons.duckduckgo.com/ip3/${new URL(v.domain ? `https://${v.domain}` : v.search).hostname}.ico`,
      })),

    // site-specific keybindings
    Object.keys(keys.maps)
      .filter((k) => k !== "global")
      .map((k) => ({
        domain:  k,
        favicon: `https://icons.duckduckgo.com/ip3/${new URL(`https://${k}`).hostname}.ico`,
      })),
  ).filter((e, i, arr) => i === arr.indexOf(e)) // Keep only first occurrence of each element

  const favicons = (await Promise.all(sites.map(async (site) => getFavicon(site))))
    .filter((e) => e !== undefined)

  faviconsManifest = favicons.reduce((acc, e) => {
    acc[e.domain] = e.name
    return acc
  }, {})

  const files = [{
    name:   paths.faviconsManifest,
    source: JSON.stringify(faviconsManifest),
  }, ...favicons]

  return file(files)
    .pipe(dest(paths.favicons))
}))

task("docs-full", series("favicons", "docs"))

const build = () =>
  src(paths.entry)
    .pipe(webpackStream(webpackConfig, webpack))
    .on("error", (err) => {
      notify.onError({
        title:   `Build failure [${pkg.name}]`,
        message: `${err.message.split("\n").slice(0, 1)}`,
      })(err)
      throw err
    })
    .pipe(rename(paths.scriptOut))
    .pipe(dest(paths.buildDir))
    .pipe(notify({
      title:   `Build success [${pkg.name}]`,
      message: "No issues",
    }))

task("build",
  parallel(
    "lint",
    build,
  ))

task("build-full",
  series(
    parallel(
      "check-priv",
      "clean",
    ),
    "build",
  ))

task("dist", parallel("docs-full", "build-full"))

task("install", series("build", () => src(path.join(paths.buildDir, paths.scriptOut))
  .pipe(dest(paths.installDir))))

const watch = (g, t) => () =>
  gulp.watch(g, { ignoreInitial: false, usePolling: true }, t)

task("watch-build", watch(paths.scripts, series("build")))

task("watch-install", watch(paths.scripts, series("install")))

task("watch-lint", watch([...paths.scripts, paths.gulpfile], series("lint")))

task("watch-docs", watch([...paths.scripts, paths.readme], series("docs")))

task("watch-docs-full", watch([...paths.scripts, paths.readme], series("docs-full")))

const serve = (done) => {
  const app = express()

  const handler = (allowedOrigin) => async (req, res) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`) // eslint-disable-line no-console
    try {
      res.sendFile(path.resolve(__dirname, paths.buildDir, paths.scriptOut), {
        headers: {
          "Content-Type":                "text/javascript; charset=UTF-8",
          "Access-Control-Allow-Origin": allowedOrigin,
        },
        maxAge: 2000,
      })
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
      res.status(500).send("Error reading config file.\n")
    }
  }

  app.get("/", handler("chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid"))
  app.get("/chrome", handler("chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid"))
  app.get("/firefox", handler("moz-extension://a7b04efeb-0b36-47f6-9f57-70293e5ee7b2"))

  app.listen(servePort)
  console.log(`web server is listening on port ${servePort}`) // eslint-disable-line no-console
  app.on("close", () => {
    console.log("web server is closing...") // eslint-disable-line no-console
    done()
  })
}

task("serve-simple", serve)

task("serve-build", parallel("watch-build", "serve-simple"))

task("serve", series("serve-build"))
task("watch", series("watch-install"))
task("default", series("build"))

// debugger
