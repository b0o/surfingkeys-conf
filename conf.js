// @ts-nocheck
const util = require("./util")
const keys = require("./keys")
const completions = require("./completions")

Hints.style(
  "background: #131421 !important; color: #828bb8 !important; border: 1px solid #82aaff;",
)
Visual.style("cursor", "background-color: #82aaff !important;")
Visual.style(
  "marks",
  "background-color: #ffc777 !important; color: black !important;",
)
// ---- Settings ----//
util.addSettings({
  hintAlign:                "left",
  omnibarSuggestionTimeout: 500,
  scrollStepSize:           140,
  smoothScroll:             true,
  richHintsForKeystroke:    1,
  theme:                    process.env.SK_THEME,
})

if (typeof Hints !== "undefined") {
  Hints.characters = "qwertasdfgzxcvb"
}

// Leader for site-specific mappings
const siteleader = "<Space>"

// Leader for OmniBar searchEngines
const searchleader = "a"

// Process mappings and completions
// See ./keys.js and ./completions.js
util.rmMaps(keys.unmaps.mappings)
util.rmSearchAliases(keys.unmaps.searchAliases)
util.processMaps(keys.maps, keys.aliases, siteleader)
util.processCompletions(completions, searchleader)

module.exports = { siteleader, searchleader }
