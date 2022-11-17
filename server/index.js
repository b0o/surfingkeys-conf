import { fileURLToPath } from "url"
import express from "express"

import paths, { getPath } from "../paths.js"
import unicodeSearch from "./unicode.js"

const servePort = 9919

const app = express()

const log = (...msg) => process.stderr.write(`${msg.join("\n")}\n`)

app.use((req, _, next) => {
  log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

const handler = (allowedOrigin) => async (req, res) => {
  try {
    // TODO: remove timeout (testing)
    setTimeout(
      () =>
        res.sendFile(getPath(paths.buildDir, paths.output), {
          headers: {
            "Content-Type": "text/javascript; charset=UTF-8",
            "Access-Control-Allow-Origin": allowedOrigin,
          },
          maxAge: 2000,
        }),
      parseInt(req.query.delay ?? 0, 10)
    )
  } catch (e) {
    log(e)
    res.status(500).send("Error retrieving config file.\n")
  }
}

app.get("/", handler("chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid"))
app.get(
  "/chrome",
  handler("chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid")
)
app.get(
  "/firefox",
  handler("moz-extension://a7b04efeb-0b36-47f6-9f57-70293e5ee7b2")
)
// app.get("/s/echo", (req, res) => res.json({ q: req.query.q?.toString() ?? "" }))
app.get("/s/unicode", (req, res) => {
  const { q } = req.query
  if (!q) {
    res.json([])
    return
  }
  const chars = unicodeSearch(q)
  res.json(chars)
})

const serve = (done) => {
  app.listen(servePort)
  log(`web server is listening on port ${servePort}`)
  app.on("close", () => {
    log("web server is closing...")
    done()
  })
}

export default serve

// If this script is run directly, start the server
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve()
}
