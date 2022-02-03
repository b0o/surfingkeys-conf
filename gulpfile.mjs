import fetch from "node-fetch"
import gulp from "gulp"
import webpack from "webpack"
import webpackStream from "webpack-stream"
import replace from "gulp-replace"
import rename from "gulp-rename"
import file from "gulp-file"
import path from "path"
import del from "del"
import platforms from "platform-folders"
import express from "express"
import gulpNotify from "gulp-notify"
import fs from "fs/promises"
import url, { fileURLToPath } from "url"
import webpackConfig from "./webpack.config.js"

const requireJson = async (f) => JSON.parse(await fs.readFile(f))
const log = (...msg) => process.stderr.write(`${msg.join("\n")}\n`)

const copyrightYearOne = 2017

const { URL } = url

const {
  task, src, dest, parallel, series,
} = gulp

const gulpfilePath = fileURLToPath(import.meta.url)

const paths = {
  assets:           "assets",
  buildDir:         "build/",
  confPrivExample:  "conf.priv.example.js",
  dirname:          path.dirname(gulpfilePath),
  favicons:         "assets/favicons",
  faviconsManifest: "favicons.json",
  gulpfile:         path.basename(gulpfilePath),
  installDir:       platforms.getConfigHome(),
  srcDir:           "src",
  output:           "surfingkeys.js",
  pkgJson:          "package.json",
  readme:           "README.tmpl.md",
  readmeOut:        "README.md",
  screenshots:      "assets/screenshots",

  sources: {
    completions: "completions.js",
    confPriv:    "conf.priv.js",
    conf:        "conf.js",
    entrypoint:  "index.js",
    keys:        "keys.js",
    util:        "util.js",
  },
}

const getPath = (...f) => path.join(paths.dirname, ...f)
const getSrcPath = (...s) => getPath(paths.srcDir, ...s)

const pkg = await requireJson(getPath(paths.pkgJson))

const getSources = (() => {
  let sources = null
  return async () => {
    if (sources !== null) {
      return sources
    }
    sources = await Object.fromEntries(
      await Promise.all(Object.entries(paths.sources).map(
        async ([name, srcPath]) =>
          [
            name,
            (await import(getSrcPath(srcPath))).default,
          ],
      )),
    )
    return sources
  }
})()

let faviconsManifest
const loadFaviconsManifest = async () => {
  if (typeof faviconsManifest === "object" && Object.keys(faviconsManifest).length > 0) {
    return
  }
  try {
    faviconsManifest = await requireJson(
      getPath(paths.favicons, paths.faviconsManifest),
    )
  } catch (e) {
    log(`Warning: couldn't load favicons manifest: ${e}`)
    faviconsManifest = {}
  }
}

const servePort = 9919

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

task("check-priv", async () => {
  try {
    await fs.stat(getSrcPath(paths.sources.priv))
  } catch (e) {
    log(`Notice: Initializing ${paths.sources.confPriv}. Configure your API keys here.`)
    return fs.copyFile(
      getPath(paths.confPrivExample),
      getSrcPath(paths.sources.confPriv),
      fs.constants.COPYFILE_EXCL,
    )
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
  const {
    completions, conf, keys, util,
  } = await getSources()
  await loadFaviconsManifest()

  const screens = {}
  let screenshotList = ""

  const screenshots = await fs.readdir(getPath(paths.screenshots))
  screenshots.forEach((s) => {
    const name = path.basename(s, ".png").split("-")
    const alias = name[0]
    if (!screens[alias]) {
      screens[alias] = []
    }
    screens[alias].push(path.join(paths.screenshots, path.basename(s)))
  })

  let complTable = Object.keys(completions).sort((a, b) => {
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
    const c = completions[k]
    const u = new URL(c.domain ? `https://${c.domain}` : c.search)
    const domain = u.hostname
    let s = ""
    if (screens[c.alias]) {
      screens[c.alias].forEach((ss, i) => {
        const num = (i > 0) ? ` ${i + 1}` : ""
        s += `<a href="#${c.name}${num.replace(" ", "-")}">:framed_picture:</a>`
        screenshotList += `##### ${c.name}${num}\n`
        screenshotList += `![${c.name} screenshot](./${ss})\n\n`
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

  const notice = "<!-- NOTICE: This file is auto-generated. Do not edit directly. -->"

  return src([getPath(paths.readme)])
    .pipe(replace("<!--{{NOTICE}}-->", notice))
    .pipe(replace("<!--{{COMPL_COUNT}}-->", Object.keys(completions).length))
    .pipe(replace("<!--{{COMPL_TABLE}}-->", complTable))
    .pipe(replace("<!--{{KEYS_MAPS_COUNT}}-->", Object.values(keys.maps).reduce((acc, m) => acc + m.length, 0)))
    .pipe(replace("<!--{{KEYS_SITES_COUNT}}-->", Object.keys(keys.maps).length))
    .pipe(replace("<!--{{KEYS_TABLE}}-->", keysTable))
    .pipe(replace("<!--{{SCREENSHOTS}}-->", screenshotList))
    .pipe(replace("<!--{{COPYRIGHT}}-->", copyright))
    .pipe(rename(paths.readmeOut))
    .pipe(dest(paths.dirname))
}))

const getFavicon = async ({ domain, favicon }, timeout = 5000) => {
  const ss = favicon
  let data
  try {
    const res = await fetch(ss, { timeout })
    if (!res.ok) {
      throw new Error(`request to ${ss} failed with code ${res.status}`)
    }
    data = await res.arrayBuffer()
  } catch (e) {
    process.stdout.write(`no favicon found for ${ss}: ${e}\n`)
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
  const { completions, keys } = await getSources()

  const sites = [].concat(
    // search engine completions
    Object.entries(completions)
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
    .pipe(dest(getPath(paths.favicons)))
}))

task("docs-full", series("favicons", "docs"))

const build = () =>
  src(getSrcPath(paths.sources.entrypoint))
    .pipe(webpackStream(webpackConfig, webpack))
    .on("error", (err) => {
      notify.onError({
        title:   `Build failure [${pkg.name}]`,
        message: `${err.message.split("\n").slice(0, 1)}`,
        timeout: 10,
      })(err)
      throw err
    })
    .pipe(rename(paths.output))
    .pipe(dest(getPath(paths.buildDir)))
    .pipe(notify({
      title:   `Build success [${pkg.name}]`,
      message: "No issues",
      timeout: 2,
    }))

task(
  "build",
  build,
)

task(
  "build-full",
  series(
    parallel(
      "check-priv",
      "clean",
    ),
    "build",
  ),
)

task("dist", parallel("docs-full", "build-full"))

task("install", series("build", () => src(getPath(paths.buildDir, paths.output))
  .pipe(dest(getPath(paths.installDir)))))

const watch = (g, t) => () =>
  gulp.watch(g, { ignoreInitial: false, usePolling: true }, t)

const srcWatchPat = getSrcPath("*.js")

task("watch-build", watch(srcWatchPat, series("build")))

task("watch-install", watch(srcWatchPat, series("install")))

task("watch-docs", watch([srcWatchPat, getPath(paths.readme)], series("docs")))

task("watch-docs-full", watch([srcWatchPat, getPath(paths.readme)], series("docs-full")))

const serve = (done) => {
  const app = express()

  const handler = (allowedOrigin) => async (req, res) => {
    log(`${new Date().toISOString()} ${req.method} ${req.url}`)
    try {
      res.sendFile(getPath(paths.buildDir, paths.output), {
        headers: {
          "Content-Type":                "text/javascript; charset=UTF-8",
          "Access-Control-Allow-Origin": allowedOrigin,
        },
        maxAge: 2000,
      })
    } catch (e) {
      log(e)
      res.status(500).send("Error reading config file.\n")
    }
  }

  app.get("/", handler("chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid"))
  app.get("/chrome", handler("chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid"))
  app.get("/firefox", handler("moz-extension://a7b04efeb-0b36-47f6-9f57-70293e5ee7b2"))

  app.listen(servePort)
  log(`web server is listening on port ${servePort}`)
  app.on("close", () => {
    log("web server is closing...")
    done()
  })
}

task("serve-simple", serve)

task("serve-build", parallel("watch-build", "serve-simple"))

task("serve", series("serve-build"))
task("watch", series("watch-install"))
task("default", series("build"))
