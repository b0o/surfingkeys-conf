const util = require("./util")
const keys = require("./keys")
const completions = require("./completions")
const custom = require("./conf.cust")

// ---- Settings ----//
util.addSettings({
  hintAlign:                "left",
  omnibarSuggestionTimeout: 500,
  richHintsForKeystroke:    1,
  theme:                    `
    /* Disable RichHints CSS animation */
    .expandRichHints {
        animation: 0s ease-in-out 1 forwards expandRichHints;
    }
    .collapseRichHints {
        animation: 0s ease-in-out 1 forwards collapseRichHints;
    }
  `,
})

util.addSettings(custom.conf || {})

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
