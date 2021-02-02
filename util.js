const { categories } = require("./help")

const util = {}

util.getCurrentLocation = (prop = "href") => {
  if (typeof window === "undefined") {
    return ""
  }
  return window.location[prop]
}

util.escape = (str) =>
  String(str).replace(/[&<>"'`=/]/g, (s) => ({
    "&":  "&amp;",
    "<":  "&lt;",
    ">":  "&gt;",
    "\"": "&quot;",
    "'":  "&#39;",
    "/":  "&#x2F;",
    "`":  "&#x60;",
    "=":  "&#x3D;",
  }[s]))

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
util.escapeRegExp = (str) =>
  str.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")

util.until = (check, test = (a) => a, maxAttempts = 50, interval = 50) =>
  new Promise((resolve, reject) => {
    const f = (attempts = 0) => {
      const res = check()
      if (!test(res)) {
        if (attempts > maxAttempts) {
          reject(new Error("until: timeout"))
        } else {
          setTimeout(() => f(attempts + 1), interval)
        }
        return
      }
      resolve(res)
    }
    f()
  })

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

util.createHintsAsync = (cssSelector, onHintKey, attrs) =>
  new Promise((resolve) =>
    Hints.create(cssSelector, (...args) => resolve(...args), attrs))

util.createHintsFiltered = (filter, {
  elems = [...document.querySelectorAll("a[href]")],
  action = Hints.dispatchMouseClick,
} = {}) =>
  Hints.create(elems.filter(filter), action)

// Determine if the given rect is visible in the viewport
util.isRectVisibleInViewport = (rect) =>
  rect.height > 0
  && rect.width > 0
  && rect.bottom >= 0
  && rect.right >= 0
  && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  && rect.left <= (window.innerWidth || document.documentElement.clientWidth)

// Determine if the given element is visible in the viewport
util.isElementInViewport = (e) =>
  e.offsetHeight > 0 && e.offsetWidth > 0
  && !e.getAttribute("disabled")
  && util.isRectVisibleInViewport(e.getBoundingClientRect())

// Process Unmaps
util.rmMaps = (a) => {
  if (typeof unmap === "undefined") {
    return
  }
  a.forEach((u) => unmap(u))
}

util.rmSearchAliases = (a) => Object.entries(a).forEach(([leader, items]) => {
  if (typeof removeSearchAliasX === "undefined") {
    return
  }
  items.forEach((v) => removeSearchAliasX(v, leader))
})

// Process Mappings
util.processMaps = (maps, aliases, siteleader) => {
  if (typeof map === "undefined" || typeof mapkey === "undefined") {
    return
  }

  const hydratedAliases = Object.entries(aliases)
    .flatMap(([baseDomain, aliasDomains]) =>
      aliasDomains.flatMap((a) => ({ [a]: maps[baseDomain] })))

  const mapsAndAliases = Object.assign({}, maps, ...hydratedAliases)

  Object.entries(mapsAndAliases).forEach(([domain, domainMaps]) => domainMaps.forEach(((mapObj) => {
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

    if (typeof mapObj.map !== "undefined") {
      map(alias, mapObj.map)
    } else {
      mapkey(key, fullDescription, callback, opts)
    }
  })))
}

// process completions
util.processCompletions = (completions, searchleader) => Object.values(completions).forEach((s) => {
  if (typeof Front === "undefined" || typeof addSearchAliasX === "undefined" || typeof mapkey === "undefined") {
    return
  }
  addSearchAliasX(s.alias, s.name, s.search, searchleader, s.compl, s.callback)
  mapkey(`${searchleader}${s.alias}`, `#8Search ${s.name}`, () => Front.openOmnibar({ type: "SearchEngine", extra: s.alias }))
  mapkey(`c${searchleader}${s.alias}`, `#8Search ${s.name} with clipboard contents`, () => {
    Clipboard.read((c) => { // TODO: use navigator.clipboard
      Front.openOmnibar({ type: "SearchEngine", pref: c.data, extra: s.alias })
    })
  })
})

util.addSettings = (s) => {
  if (typeof settings === "undefined") {
    return
  }
  Object.assign(settings, s)
}

module.exports = util
