// This is a reference for how conf.priv.js should look.
//
// Copy this file to a new file named "conf.priv.js" and update
// the API keys as needed.
//
// You can also place any additional variables here and they will
// be included before the rest of your configuration script.
// Running `gulp build` will generate the final configuration by concatenating
// this file with your main configuration file.
//
// WARNING: Don't `git commit` your actual "conf.priv.js" file if you
// add real API keys to it! Malicious parties frequently scan GitHub for
// these keys and use them for bad stuff. The "conf.priv.js" file is already
// ignored by .gitignore, but just be safe.

// These are private API keys which are required for certain search completions.
// You can obtain them all for free at the supplied links.
//
// Note:
// The Domainr API is configured for High-Volume usage, not Mashape.
// You will need to modify the code in completions.js to work with the Mashape API if desired.
// Open an issue if you can't figure this out and I'll help out.
var keys =
    { crunchbase:   "foo"    // https://about.crunchbase.com/crunchbase-basic-access/
    , domainr:      "bar"    // https://domainr.build/docs/overview#section-try-it-for-free
    , google_ex:    "qux"    // https://developers.google.com/custom-search/json-api/v1/overview?hl=en_US
    , google_ex_cx: "ham"    // This is the Search Engine ID (cx) from your Google Custom Search
    , google_yt:    "spam"   // https://developers.google.com/youtube/v3/docs/
    , wolframalpha: "lorem"  // https://products.wolframalpha.com/api/
    };
