const { categories } = require("./help")

const util = {}

util.escape = str => String(str).replace(/[&<>"'`=/]/g, s => ({
  "&":  "&amp;",
  "<":  "&lt;",
  ">":  "&gt;",
  "\"": "&quot;",
  "'":  "&#39;",
  "/":  "&#x2F;",
  "`":  "&#x60;",
  "=":  "&#x3D;",
}[s]))

util.createSuggestionItem = (html, props = {}) => {
  const li = document.createElement("li")
  li.innerHTML = html
  return { html: li.outerHTML, props }
}

util.createURLItem = (title, url, sanitize = true) => {
  let t = title
  let u = url
  if (sanitize) {
    t = util.escape(t)
    u = new URL(u).toString()
  }
  return util.createSuggestionItem(`
      <div class="title">${t}</div>
      <div class="url">${u}</div>
    `, { url: u })
}

// Determine if the given rect is visible in the viewport
util.isRectVisibleInViewport = rect => (
  rect.height > 0 &&
  rect.width > 0 &&
  rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
)

// Determine if the given element is visible in the viewport
util.isElementInViewport = e => util.isRectVisibleInViewport(e.getBoundingClientRect())

// Process Unmaps
util.rmMaps = a => a.forEach(u => unmap(u))

util.rmSearchAliases = a => Object.entries(a).forEach(([leader, items]) =>
  items.forEach(v =>
    removeSearchAliasX(v, leader)))

// Process Mappings
util.processMaps = (maps, siteleader) =>
  Object.entries(maps).forEach(([domain, domainMaps]) =>
    domainMaps.forEach(((mapObj) => {
      const {
        alias,
        callback,
        leader = (domain === "global") ? "" : siteleader,
        category = categories.misc,
        description = "",
      } = mapObj
      const opts = {}


      const key = `${leader}${alias}`

      // Determine if it's a site-specific mapping
      if (domain !== "global") {
        const d = domain.replace(".", "\\.")
        opts.domain = new RegExp(`^http(s)?://(([a-zA-Z0-9-_]+\\.)*)(${d})(/.*)?`)
      }

      const fullDescription = `#${category} ${description}`

      if (mapObj.map !== undefined) {
        map(alias, mapObj.map)
      } else {
        mapkey(key, fullDescription, callback, opts)
      }
    })))

// process completions
util.processCompletions = (completions, searchleader) => Object.values(completions).forEach((s) => {
  addSearchAliasX(s.alias, s.name, s.search, searchleader, s.compl, s.callback)
  mapkey(`${searchleader}${s.alias}`, `#8Search ${s.name}`, () => Front.openOmnibar({ type: "SearchEngine", extra: s.alias }))
})

module.exports = util
