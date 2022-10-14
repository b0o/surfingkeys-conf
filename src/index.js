import conf from "./conf.js"
import help from "./help.js"
import api from "./api.js"

const { categories } = help
const {
  mapkey,
  map,
  unmap,
  Clipboard,
  Front,
  removeSearchAlias,
  addSearchAlias,
} = api

const registerKey = (domain, mapObj, siteleader) => {
  const {
    alias,
    callback,
    leader = (domain === "global") ? "" : siteleader,
    category = categories.misc,
    description = "",
    path = "(/.*)?",
  } = mapObj
  const opts = {}

  const key = `${leader}${alias}`

  if (domain !== "global") {
    const d = domain.replace(".", "\\.")
    opts.domain = new RegExp(`^http(s)?://(([a-zA-Z0-9-_]+\\.)*)(${d})${path}`)
  }

  const fullDescription = `#${category} ${description}`

  if (typeof mapObj.map !== "undefined") {
    map(alias, mapObj.map)
  } else {
    mapkey(key, fullDescription, callback, opts)
  }
}

const registerKeys = (maps, aliases, siteleader) => {
  const hydratedAliases = Object.entries(aliases)
    .flatMap(([baseDomain, aliasDomains]) =>
      aliasDomains.flatMap((a) => ({ [a]: maps[baseDomain] })))

  const mapsAndAliases = Object.assign({}, maps, ...hydratedAliases)

  Object.entries(mapsAndAliases).forEach(([domain, domainMaps]) =>
    domainMaps.forEach((mapObj) =>
      registerKey(domain, mapObj, siteleader)))
}

const registerSearchEngines = (searchEngines, searchleader) =>
  Object.values(searchEngines).forEach((s) => {
    const options = {
      favicon_url: s.favicon,
    }
    addSearchAlias(
      s.alias,
      s.name,
      s.search,
      searchleader,
      s.compl,
      s.callback,
      undefined,
      options,
    )
    mapkey(`${searchleader}${s.alias}`, `#8Search ${s.name}`, () => Front.openOmnibar({ type: "SearchEngine", extra: s.alias }))
    mapkey(`c${searchleader}${s.alias}`, `#8Search ${s.name} with clipboard contents`, () => {
      Clipboard.read((c) => {
        Front.openOmnibar({ type: "SearchEngine", pref: c.data, extra: s.alias })
      })
    })
    if (searchleader !== "o") {
      unmap(`o${s.alias}`)
    }
  })

const main = () => {
  window.surfingKeys = api
  console.log({ window, surfingKeys: window.surfingKeys })
  if (conf.settings) {
    Object.assign(
      settings,
      typeof conf.settings === "function" ? conf.settings() : conf.settings,
    )
  }

  if (conf.keys && conf.keys.unmaps) {
    const { unmaps } = conf.keys
    if (unmaps.mappings) {
      unmaps.mappings.forEach((m) => unmap(m))
    }
    if (unmaps.searchAliases) {
      Object.entries(unmaps.searchAliases).forEach(([leader, items]) => {
        items.forEach((v) => removeSearchAlias(v, leader))
      })
    }
  }

  if (conf.searchEngines) {
    registerSearchEngines(conf.searchEngines, conf.searchleader ?? "o")
  }

  if (conf.keys && conf.keys.maps) {
    const { keys } = conf
    const { maps, aliases = {} } = keys
    registerKeys(maps, aliases, conf.siteleader)
  }
}

if (typeof window !== "undefined") {
  main()
  // try {
  //   main()
  // } catch (err) {
  //   console.trace(err)
  // }
}
