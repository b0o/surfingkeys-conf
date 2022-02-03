module.exports = {
  settings: () => ({
    /* eslint-disable global-require */
    hintAlign:                "left",
    omnibarSuggestionTimeout: 500,
    richHintsForKeystroke:    1,
    defaultSearchEngine:      "dd",
    theme:                    require("./theme.css"),
  }),
  keys:           require("./keys"),
  completions:    require("./completions"),
  hintCharacters: "qwertasdfgzxcvb",

  // Leader for site-specific mappings
  siteleader: "<Space>",

  // Leader for OmniBar searchEngines
  searchleader: "a",
}
