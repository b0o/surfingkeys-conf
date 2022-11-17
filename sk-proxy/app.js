const express = require("express")
const morgan = require("morgan")
const fetch = require("node-fetch")

const app = express()

app.use(morgan("dev"))

app.get("/domainr", async (req, res) => {
  if (!(req.query.q && typeof req.query.q === "string")) {
    res.status(400).send({ error: "Invalid request" })
    return
  }

  const q = encodeURIComponent(req.query.q)
  const key = `mashape-key=${process.env.KEY_DOMAINR}`
  const baseURL = "https://domainr.p.mashape.com/v2/"

  const domains = {}

  try {
    const subRes = await fetch(`${baseURL}search/?${key}&query=${q}`)
    const data = await subRes.json()
    if (!Array.isArray(data.results)) {
      res.status(500).send({ error: "Error querying Domainr" })
      return
    }
    Object.assign(
      domains,
      data.results.reduce((acc, d) => {
        acc[d.domain] = { status: ["unknown"], summary: "unknown" }
        return acc
      }, {})
    )
  } catch (e) {
    res.status(500).send({ error: "domainr search error" })
    return
  }

  const domainsStr = Object.keys(domains).join(",")
  if (domainsStr.length === 0) {
    res.send(domains)
    return
  }

  try {
    const subRes = await fetch(`${baseURL}status/?${key}&domain=${domainsStr}`)
    const data = await subRes.json()
    if (!Array.isArray(data.status)) {
      res
        .status(500)
        .send({ error: "domainr status: unexpected empty response" })
      return
    }
    Object.assign(
      domains,
      data.status.reduce((acc, d) => {
        acc[d.domain] = { status: d.status.split(" "), summary: d.summary }
        return acc
      }, {})
    )
  } catch (e) {
    res.status(500).send({ error: "domainr status error" })
    return
  }

  res.send(domains)
})

module.exports = app
