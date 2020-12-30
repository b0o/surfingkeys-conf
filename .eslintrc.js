module.exports = {
  extends: "airbnb-base",
  globals: {
    RUNTIME:            false,
    Omnibar:            false,
    Front:              false,
    Clipboard:          false,
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
  },
  rules: {
    semi:             ["error", "never"],
    "comma-dangle":   ["warn", "always-multiline"],
    quotes:           ["warn", "double"],
    "no-cond-assign": ["error", "except-parens"],

    "newline-per-chained-call": "off",
    "no-restricted-syntax":     "off",
    "implicit-arrow-linebreak": "off",

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
