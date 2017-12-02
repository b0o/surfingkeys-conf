module.exports = {
  extends: "airbnb",
  globals: {
    Omnibar:            false,
    Front:              false,
    runtime:            false,
    chrome:             false,
    tabOpenLink:        false,
    Hints:              false,
    unmap:              false,
    map:                false,
    mapkey:             false,
    settings:           false,
    removeSearchAliasX: false,
    addSearchAliasX:    false,
    completions:        false,
  },
  env: {
    browser: true,
    node:    true,
    jquery:  true,
  },
  rules: {
    semi:           ["error", "never"],
    "comma-dangle": ["warn", "always-multiline"],
    quotes:         ["warn", "double"],

    "newline-per-chained-call": "off",

    "key-spacing": [
      "warn",
      {
        singleLine: {
          beforeColon: false,
          afterColon:  true,
        },
        multiLine: {
          beforeColon: false,
          afterColon:  true,
          align:       "value",
        },
      },
    ],

    indent: [
      "warn",
      2,
      {
        SwitchCase:         0,
        VariableDeclarator: { var: 2, let: 2, const: 3 },
      },
    ],
  },
}

