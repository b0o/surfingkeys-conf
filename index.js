const util = require("./util")
const conf = require("./conf")

const main = () => {
  if (conf.settings) {
    const settings = typeof conf.settings === "function" ? conf.settings() : conf.settings
    util.addSettings(settings)
  }

  if (conf.keys && conf.keys.unmaps) {
    const { unmaps } = conf.keys
    if (unmaps.mappings) util.rmMaps(unmaps.mappings)
    if (unmaps.searchAliases) util.rmSearchAliases(unmaps.searchAliases)
  }

  if (conf.completions) {
    util.processCompletions(conf.completions, conf.searchleader ?? "o")
  }

  if (conf.keys && conf.keys.maps) {
    const { keys } = conf
    const { maps, aliases = {} } = keys
    util.processMaps(maps, aliases, conf.siteleader)
  }
}

if (util.getContext() === "browser") main()
