// This is a reference for how conf.priv.js should look.
//
// Copy this file to a new file named "conf.priv.js" and update
// the API keys as needed.
//
// WARNING: Don't `git commit` your actual "conf.priv.js" file if you
// add real API keys to it! Malicious parties frequently scan GitHub for
// these keys and use them for bad stuff. The "conf.priv.js" file is already
// ignored by .gitignore, but just be safe.

// These are private API keys which are required for certain search completions.
// You can obtain them all for free at the supplied links.
var keys = {
    crunchbase:   "", // https://about.crunchbase.com/crunchbase-basic-access/
    google_cs:    "", // https://developers.google.com/custom-search/json-api/v1/overview?hl=en_US
    google_yt:    "", // https://developers.google.com/youtube/v3/docs/
    wolframalpha: "", // https://products.wolframalpha.com/api/

    // Note:
    // The Domainr API is configured for High-Volume usage, not Mashape.
    // You will need to modify the code in completions.js to work with the Mashape API if desired.
    // Open an issue if you can't figure this out and I'd be happy to help.
    domainr:      "", // https://domainr.build/docs/overview#section-try-it-for-free

    //*** Google Custom Search Engines ***//
    // Can be created at https://cse.google.com/cse
    // Simply create a separate Custom Search Engine for each of the following entries,
    // pasting the provided URL string in the "Sites to Search" field.
    // Then, after creation, go to the control panel for the new Search Engine and copy the
    // Search Engine ID (cx) into the appropriate configuration variable below:
    google_cx_ex: "", // hexdocs.pm/*/master/*.html
    google_cx_af: "", // bbs.archlinux.org/*
    google_cx_al: "", // www.archlinux.org/packages/*/x86_64/*
    google_cx_no: "", // nodejs.org/api/*
    google_cx_cs: "", // chrome.google.com/webstore/*
    google_cx_jq: "", // api.jquery.com/*
};

// You can place any additional private/sensitive variables here and they will
// be included before the rest of your configuration scripts.
// Running `gulp build` will generate the final configuration by concatenating
// this file with your main configuration files.
