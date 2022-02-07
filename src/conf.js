/* eslint-disable global-require */

module.exports = {
  settings: () => ({
    hintAlign:                "left",
    omnibarSuggestionTimeout: 500,
    richHintsForKeystroke:    1,
    defaultSearchEngine:      "dd",
    theme:                    require("./theme.css"),
  }),
  keys:           require("./keys"),
  searchEngines:  require("./search-engines"),
  hintCharacters: "qwertasdfgzxcvb",

  // Leader for site-specific mappings
  siteleader: "<Space>",

  // Leader for OmniBar searchEngines
  searchleader: "a",
}
