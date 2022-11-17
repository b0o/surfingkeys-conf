import path from "path"
import { fileURLToPath } from "url"
import platforms from "platform-folders"

const gulpfilePath = fileURLToPath(import.meta.url)

const paths = {
  assets: "assets",
  buildDir: "build/",
  confPrivExample: "conf.priv.example.js",
  dirname: path.dirname(gulpfilePath),
  favicons: "assets/favicons",
  faviconsManifest: "favicons.json",
  gulpfile: path.basename(gulpfilePath),
  installDir: platforms.getConfigHome(),
  srcDir: "src",
  output: "surfingkeys.js",
  pkgJson: "package.json",
  readme: "README.tmpl.md",
  readmeOut: "README.md",
  screenshots: "assets/screenshots",

  sources: {
    api: "api.js",
    actions: "actions.js",
    conf: "conf.js",
    confPriv: "conf.priv.js",
    entrypoint: "index.js",
    keys: "keys.js",
    searchEngines: "search-engines.js",
    util: "util.js",
  },
}

export default paths

export const getPath = (...f) => path.join(paths.dirname, ...f)
export const getSrcPath = (...s) => getPath(paths.srcDir, ...s)
