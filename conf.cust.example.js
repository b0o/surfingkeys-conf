/*
Place for any custom settings/mappings (mostly documented on https://github.com/brookhong/Surfingkeys
 */

// const { categories } = require("./help")
// mappings must go in this specific format
const maps = {
  /*
  define mappings in format:
   "domain.com": [ // or just "general"
     {
       alias: "", // here keybinding
       category: 0, // best from the categories requirement
       description: "The description of the mapping", // self explanatory
       // Now either of the:
       map: "", // the key remapping, of:
       callback: () => {} // the callback
     }
   ]
   */

}
// note that every alias key has to be present in the maps keys
const aliases = {
  /*
    "domain.com": [
      "example.com" // also known as
    ]
   */
}
// custom settings (for example: theme)
const conf = {
  /*
    theme: 'body: { bg-color: "black" }'
   */
}

// miscellanous entries
const leaders = {
  /*
    site: "",
    search: "",
   */
}

const hints = ""

module.exports = {
  maps,
  aliases,
  conf,
  leaders,
  hints
}
