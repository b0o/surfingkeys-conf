const actions = require("./actions")
const { categories } = require("./help")

// Remove undesired default mappings
const unmaps = {
  mappings: [
    "sb", "sw", "ob",
    "ow", "cp", ";cp",
    ";ap", "spa", "spb",
    "spd", "sps", "spc",
    "spi", "sfr", "zQ",
    "zz", "zR", "ab",
    "Q", "q", "ag",
    "af", ";s", "yp",
    "<Ctrl-j>", "<Ctrl-h>",
  ],
  searchAliases: {
    s: ["g", "d", "b",
      "w", "s", "h"],
  },
}

const maps = {}

maps.global = [
  {
    alias:       "F",
    map:         "gf",
    category:    categories.mouseClick,
    description: "Open a link in non-active new tab",
  },
  {
    alias:       "zf",
    category:    categories.mouseClick,
    description: "Open link URL in vim editor",
    callback:    actions.previewLink,
  },
  {
    alias:       "w",
    map:         "k",
    category:    categories.scroll,
    description: "Scroll up",
  },
  {
    alias:       "s",
    map:         "j",
    category:    categories.scroll,
    description: "Scroll down",
  },
  {
    alias:       "K",
    map:         "e",
    category:    categories.scroll,
    description: "Scroll half page up",
  },
  {
    alias:       "J",
    map:         "d",
    category:    categories.scroll,
    description: "Scroll half page down",
  },
  {
    alias:       "gh",
    category:    categories.scroll,
    description: "Scroll to element targeted by URL hash",
    callback:    actions.scrollToHash,
  },
  {
    alias:       "gi",
    category:    categories.pageNav,
    description: "Edit current URL with vim editor",
    callback:    actions.vimEditURL,
  },
  {
    alias:       "gi",
    category:    categories.pageNav,
    description: "Edit current URL with vim editor",
    callback:    actions.vimEditURL,
  },
  {
    alias:       "gI",
    category:    categories.pageNav,
    description: "View image in new tab",
    callback:    actions.createHints("img", (i) => actions.openLink(i.src)()),
  },
  {
    alias:       "yp",
    category:    categories.clipboard,
    description: "Copy URL path of current page",
    callback:    actions.copyURLPath(),
  },
  {
    alias:       "yI",
    category:    categories.clipboard,
    description: "Copy Image URL",
    // TODO: use navigator.clipboard
    callback:    actions.createHints("img", (i) => Clipboard.write(i.src)),
  },
  {
    alias:       "yO",
    category:    categories.clipboard,
    description: "Copy page URL/Title as Org-mode link",
    callback:    actions.copyOrgLink,
  },
  {
    alias:       "yM",
    category:    categories.clipboard,
    description: "Copy page URL/Title as Markdown link",
    callback:    actions.copyMarkdownLink,
  },
  {
    alias:       "yT",
    category:    categories.tabs,
    description: "Duplicate current tab (non-active new tab)",
    callback:    actions.duplicateTab,
  },
  {
    alias:       ";se",
    category:    categories.settings,
    description: "Edit Settings",
    callback:    actions.editSettings,
  },
  {
    alias:       "gS",
    category:    categories.chromeURLs,
    description: "Open Chrome settings",
  },
  {
    alias:       "=w",
    category:    categories.misc,
    description: "Lookup whois information for domain",
    callback:    actions.showWhois(),
  },
  {
    alias:       "=d",
    category:    categories.misc,
    description: "Lookup dns information for domain",
    callback:    actions.showDns(),
  },
  {
    alias:       "=D",
    category:    categories.misc,
    description: "Lookup all information for domain",
    callback:    actions.showDns({ verbose: true }),
  },
  {
    alias:       "=c",
    category:    categories.misc,
    description: "Show Google's cached version of page",
    callback:    actions.showGoogleCache(),
  },
  {
    alias:       "=a",
    category:    categories.misc,
    description: "Show Archive.org Wayback Machine for page",
    callback:    actions.showWayback(),
  },
  {
    alias:       "=o",
    category:    categories.misc,
    description: "Show outline.com version of page",
    callback:    actions.showOutline(),
  },
  {
    alias:       "=r",
    category:    categories.misc,
    description: "Subscribe to RSS feed for page",
    callback:    actions.rssSubscribe(),
  },
  {
    alias:       "=s",
    category:    categories.misc,
    description: "Speed read page",
    callback:    actions.showSpeedReader,
  },
  {
    alias:       ";pd",
    category:    categories.misc,
    description: "Toggle PDF viewer from SurfingKeys",
    callback:    actions.togglePdfViewer,
  },
  {
    alias:       "gxE",
    map:         "gxt",
    category:    categories.tabs,
    description: "Close tab to left",
  },
  {
    alias:       "gxR",
    map:         "gxT",
    category:    categories.tabs,
    description: "Close tab to right",
  },
  {
    alias:       "\\cgh",
    category:    categories.clipboard,
    description: "Open clipboard string as GitHub path (e.g. 'torvalds/linux')",
    callback:    actions.gh.openRepoFromClipboard,
  },
]

maps["amazon.com"] = [
  {
    alias:       "fs",
    description: "Fakespot",
    callback:    actions.fakeSpot,
  },
  {
    alias:       "a",
    description: "View product",
    callback:    actions.az.viewProduct,
  },
  {
    alias:       "c",
    description: "Add to Cart",
    callback:    actions.createHints("#add-to-cart-button"),
  },
  {
    alias:       "R",
    description: "View Product Reviews",
    callback:    actions.openLink("#customerReviews"),
  },
  {
    alias:       "Q",
    description: "View Product Q&A",
    callback:    actions.openLink("#Ask"),
  },
  {
    alias:       "A",
    description: "Open Account page",
    callback:    actions.openLink("/gp/css/homepage.html"),
  },
  {
    alias:       "C",
    description: "Open Cart page",
    callback:    actions.openLink("/gp/cart/view.html"),
  },
  {
    alias:       "O",
    description: "Open Orders page",
    callback:    actions.openLink("/gp/css/order-history"),
  },
]

const googleSearchResultSelector = [
  "a h3",
  "h3 a",
  "a[href^='/search']:not(.fl):not(#pnnext,#pnprev):not([role]):not(.hide-focus-ring)",
  "g-scrolling-carousel a",
  ".rc > div:nth-child(2) a",
  ".kno-rdesc a",
  ".kno-fv a",
  ".isv-r > a:first-child",
  ".dbsr > a:first-child",
].join(",")

maps["www.google.com"] = [
  {
    alias:       "a",
    description: "Open search result",
    callback:    actions.createHints(googleSearchResultSelector),
  },
  {
    alias:       "A",
    description: "Open search result (new tab)",
    callback:    actions.createHints(googleSearchResultSelector,
      actions.openAnchor({ newTab: true, active: false })),
  },
  {
    alias:       "d",
    description: "Open search in DuckDuckGo",
    callback:    actions.go.ddg,
  },
]

maps["algolia.com"] = [
  {
    alias:       "a",
    description: "Open search result",
    callback:    actions.createHints(".item-main h2>a:first-child"),
  },
]

maps["duckduckgo.com"] = [
  {
    alias:       "a",
    description: "Open search result",
    callback:    actions.createHints(".result__a"),
  },
  {
    alias:       "A",
    description: "Open search result (non-active new tab)",
    callback:    actions.createHints(".result__a",
      actions.openAnchor({ newTab: true, active: false })),
  },
  {
    leader:      "",
    alias:       "]]",
    description: "Show more results",
    callback:    () => document.querySelector(".result--more__btn").click(),
  },
  {
    alias:       "g",
    description: "Open search in Google",
    callback:    actions.dg.goog,
  },
]

maps["yelp.com"] = [
  {
    alias:       "fs",
    description: "Fakespot",
    callback:    actions.fakeSpot,
  },
]

maps["youtube.com"] = [
  {
    leader:      "",
    alias:       "A",
    description: "Open video",
    callback:    actions.createHints("*[id='video-title']",
      actions.openAnchor({ newTab: true })),
  },
  {
    leader:      "",
    alias:       "C",
    description: "Open channel",
    callback:    actions.createHints("*[id='byline']"),
  },
  {
    leader:      "",
    alias:       "gH",
    description: "Goto homepage",
    callback:    actions.openLink("https://www.youtube.com/feed/subscriptions?flow=2"),
  },
  {
    leader:      "",
    alias:       "F",
    description: "Toggle fullscreen",
    callback:    () => document.querySelector(".ytp-fullscreen-button.ytp-button").click(),
  },
]

maps["vimeo.com"] = [
  {
    alias:       "F",
    description: "Toggle fullscreen",
    callback:    () => document.querySelector(".fullscreen-icon").click(),
  },
]

maps["github.com"] = [
  {
    alias:       "A",
    description: "Open repository Actions page",
    callback:    actions.gh.openRepoPage("/actions"),
  },
  {
    alias:       "C",
    description: "Open repository Commits page",
    callback:    actions.gh.openRepoPage("/commits"),
  },
  {
    alias:       "I",
    description: "Open repository Issues page",
    callback:    actions.gh.openRepoPage("/issues"),
  },
  {
    alias:       "P",
    description: "Open repository Pull Requests page",
    callback:    actions.gh.openRepoPage("/pulls"),
  },
  {
    alias:       "R",
    description: "Open Repository page",
    callback:    actions.gh.openRepoPage("/"),
  },
  {
    alias:       "S",
    description: "Open repository Settings page",
    callback:    actions.gh.openRepoPage("/settings"),
  },
  {
    alias:       "W",
    description: "Open repository Wiki page",
    callback:    actions.gh.openRepoPage("/wiki"),
  },
  {
    alias:       "X",
    description: "Open repository Security page",
    callback:    actions.gh.openRepoPage("/security"),
  },
  {
    alias:       "O",
    description: "Open repository Owner's profile page",
    callback:    actions.gh.openRepoOwner,
  },
  {
    alias:       "M",
    description: "Open your profile page ('Me')",
    callback:    actions.gh.openProfile,
  },
  {
    alias:       "a",
    description: "View Repository",
    callback:    actions.gh.openRepo,
  },
  {
    alias:       "u",
    description: "View User",
    callback:    actions.gh.openUser,
  },
  {
    alias:       "f",
    description: "View File",
    callback:    actions.gh.openFile,
  },
  {
    alias:       "c",
    description: "View Commit",
    callback:    actions.gh.openCommit,
  },
  {
    alias:       "i",
    description: "View Issue",
    callback:    actions.gh.openIssue,
  },
  {
    alias:       "p",
    description: "View Pull Request",
    callback:    actions.gh.openPull,
  },
  {
    alias:       "e",
    description: "View external link",
    callback:    actions.createHints("a[rel=nofollow]"),
  },
  { // TODO: Add repetition support: 3gu
    leader:      "",
    alias:       "gu",
    description: "Go up one path in the URL (GitHub)",
    callback:    actions.gh.goParent,
  },
  {
    alias:       "s",
    description: "Toggle Star",
    callback:    actions.gh.star({ toggle: true }),
  },
  {
    alias:       "y",
    description: "Copy Project Path",
    callback:    actions.copyURLPath({ count: 2 }),
  },
  {
    alias:       "L",
    description: "Copy clone Path",
    callback:    actions.copyURLPath({ count: 2, replace: (path) => `git@github.com:${path}.git` }),
  },
  {
    alias:       "Y",
    description: "Copy Project Path (including domain)",
    callback:    actions.copyURLPath({ count: 2, domain: true }),
  },
  {
    alias:       "l",
    description: "Toggle repo language stats",
    callback:    actions.gh.toggleLangStats,
  },
  {
    alias:       "D",
    description: "View GoDoc for Project",
    callback:    actions.viewGodoc,
  },
  {
    alias:       "G",
    description: "View on SourceGraph",
    callback:    actions.gh.viewSourceGraph,
  },
  {
    alias:       "ra",
    description: "View live raw version of file",
    callback:    actions.gh.viewRaw,
  },
  {
    alias:       "gcp",
    description: "Open clipboard string as file path in repo",
    callback:    actions.gh.openFileFromClipboard,
  },
]

maps["gitlab.com"] = [
  {
    alias:       "s",
    description: "Toggle Star",
    callback:    actions.gl.star,
  },
  {
    alias:       "y",
    description: "Copy Project Path",
    callback:    actions.copyURLPath({ count: 2 }),
  },
  {
    alias:       "Y",
    description: "Copy Project Path (including domain)",
    callback:    actions.copyURLPath({ count: 2, domain: true }),
  },
  {
    alias:       "D",
    description: "View GoDoc for Project",
    callback:    actions.viewGodoc,
  },
]

maps["twitter.com"] = [
  {
    alias:       "f",
    description: "Follow user",
    callback:    actions.createHints("div[role='button'][data-testid$='follow']"),
  },
  {
    alias:       "s",
    description: "Like tweet",
    callback:    actions.createHints("div[role='button'][data-testid$='like']"),
  },
  {
    alias:       "R",
    description: "Retweet",
    callback:    actions.createHints("div[role='button'][data-testid$='retweet']"),
  },
  {
    alias:       "c",
    description: "Comment/Reply",
    callback:    actions.createHints("div[role='button'][data-testid='reply']"),
  },
  {
    alias:       "T",
    description: "New tweet",
    callback:    () => document.querySelector("a[role='button'][data-testid='SideNav_NewTweet_Button']").click(),
  },
  {
    alias:       "u",
    description: "Goto user",
    callback:    actions.tw.openUser,
  },
  {
    alias:       "t",
    description: "Goto tweet",
    callback:    actions.createHints("article, article div[data-focusable='true'][role='link'][tabindex='0']"),
  },
]

maps["reddit.com"] = [
  {
    alias:       "x",
    description: "Collapse comment",
    callback:    actions.createHints(".expand"),
  },
  {
    alias:       "X",
    description: "Collapse next comment",
    callback:    actions.re.collapseNextComment,
  },
  {
    alias:       "s",
    description: "Upvote",
    callback:    actions.createHints(".arrow.up"),
  },
  {
    alias:       "S",
    description: "Downvote",
    callback:    actions.createHints(".arrow.down"),
  },
  {
    alias:       "e",
    description: "Expand expando",
    callback:    actions.createHints(".expando-button"),
  },
  {
    alias:       "a",
    description: "View post (link)",
    callback:    actions.createHints(".title"),
  },
  {
    alias:       "A",
    description: "View post (link) (non-active new tab)",
    callback:    actions.createHints(".title",
      actions.openAnchor({ newTab: true, active: false })),
  },
  {
    alias:       "c",
    description: "View post (comments)",
    callback:    actions.createHints(".comments"),
  },
  {
    alias:       "C",
    description: "View post (comments) (non-active new tab)",
    callback:    actions.createHints(".comments",
      actions.openAnchor({ newTab: true, active: false })),
  },
]

maps["news.ycombinator.com"] = [
  {
    alias:       "x",
    description: "Collapse comment",
    callback:    actions.createHints(".togg"),
  },
  {
    alias:       "X",
    description: "Collapse next comment",
    callback:    actions.hn.collapseNextComment,
  },
  {
    alias:       "s",
    description: "Upvote",
    callback:    actions.createHints(".votearrow[title='upvote']"),
  },
  {
    alias:       "S",
    description: "Downvote",
    callback:    actions.createHints(".votearrow[title='downvote']"),
  },
  {
    alias:       "a",
    description: "View post (link)",
    callback:    actions.createHints(".storylink"),
  },
  {
    alias:       "A",
    description: "View post (link and comments)",
    callback:    actions.createHints(".athing", actions.hn.openLinkAndComments),
  },
  {
    alias:       "c",
    description: "View post (comments)",
    callback:    actions.createHints("td > a[href*='item']:not(.storylink)"),
  },
  {
    alias:       "C",
    description: "View post (comments) (non-active new tab)",
    callback:    actions.createHints("td > a[href*='item']:not(.storylink)",
      actions.openAnchor({ newTab: true, active: false })),
  },
  {
    alias:       "e",
    description: "View external link",
    callback:    actions.createHints("a[rel=nofollow]"),
  },
  {
    leader:      "",
    alias:       "gp",
    description: "Go to parent",
    callback:    actions.hn.goParent,
  },
  {
    leader:      "",
    alias:       "]]",
    description: "Next page",
    callback:    () => actions.hn.goPage(1),
  },
  {
    leader:      "",
    alias:       "[[",
    description: "Prev page",
    callback:    () => actions.hn.goPage(-1),
  },
]

maps["producthunt.com"] = [
  {
    alias:       "a",
    description: "View product (external)",
    callback:    actions.ph.openExternal,
  },
  {
    alias:       "v",
    description: "View product",
    callback:    actions.createHints("ul[class^='postsList_'] > li > div[class^='item_'] > a"),
  },
  {
    alias:       "s",
    description: "Upvote product",
    callback:    actions.createHints("button[data-test='vote-button']"),
  },
]

maps["dribbble.com"] = [
  {
    alias:       "s",
    description: "Heart Shot",
    callback:    actions.createHints(".toggle-fav, .like-shot"),
  },
  {
    alias:       "a",
    description: "View shot",
    callback:    actions.createHints(".dribbble-over, .gif-target, .more-thumbs a"),
  },
  {
    alias:       "A",
    description: "View shot (non-active new tab)",
    callback:    actions.createHints(".dribbble-over, .gif-target, .more-thumbs a",
      actions.openAnchor({ newTab: true, active: false })),
  },
  {
    alias:       "v",
    description: "View attachment image",
    callback:    actions.dr.attachment(),
  },
  {
    alias:       "V",
    description: "Yank attachment image source URL",
    // TODO: use navigator.clipboard
    callback:    actions.dr.attachment((a) => Clipboard.write(a)),
  },
  {
    alias:       "z",
    description: "Zoom shot",
    callback:    actions.createHints(".single-img picture, .detail-shot img"),
  },
]

maps["behance.net"] = [
  {
    alias:       "s",
    description: "Appreciate project",
    callback:    actions.createHints(".appreciation-button"),
  },
  {
    alias:       "b",
    description: "Add project to collection",
    callback:    () => document.querySelector(".qa-action-collection").click(),
  },
  {
    alias:       "a",
    description: "View project",
    callback:    actions.createHints(".rf-project-cover__title"),
  },
  {
    alias:       "A",
    description: "View project (non-active new tab)",
    callback:    actions.createHints(".rf-project-cover__title",
      actions.openAnchor({ newTab: true, active: false })),
  },
]

maps["fonts.adobe.com"] = [
  {
    alias:       "a",
    description: "Activate font",
    callback:    actions.createHints(".spectrum-ToggleSwitch-input"),
  },
  {
    alias:       "s",
    description: "Favorite font",
    callback:    actions.createHints(".favorite-toggle-icon"),
  },
]

maps["wikipedia.org"] = [
  {
    alias:       "s",
    description: "Toggle simple version of current article",
    callback:    actions.wp.toggleSimple,
  },
  {
    alias:       "a",
    description: "View page",
    callback:    actions.createHints("#bodyContent :not(sup):not(.mw-editsection) > a:not([rel=nofollow])"),
  },
  {
    alias:       "e",
    description: "View external link",
    callback:    actions.createHints("a[rel=nofollow]"),
  },
  {
    alias:       "R",
    description: "View WikiRank for current article",
    callback:    actions.wp.viewWikiRank,
  },
]

maps["craigslist.org"] = [
  {
    alias:       "a",
    description: "View listing",
    callback:    actions.createHints("a.result-title"),
  },
]

maps["stackoverflow.com"] = [
  {
    alias:       "a",
    description: "View question",
    callback:    actions.createHints("a.question-hyperlink"),
  },
]

maps["aur.archlinux.org"] = [
  {
    alias:       "a",
    description: "View package",
    callback:    actions.createHints("a[href^='/packages/'][href$='/']"),
  },
]

maps["home.nest.com"] = [
  {
    path:        "/thermostat/DEVICE_.*",
    leader:      "",
    alias:       "=",
    description: "Increment temperature",
    callback:    actions.nt.adjustTemp(1),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    leader:      "",
    alias:       "-",
    description: "Decrement temperature",
    callback:    actions.nt.adjustTemp(-1),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    alias:       "h",
    description: "Switch mode to Heat",
    callback:    actions.nt.setMode("heat"),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    alias:       "c",
    description: "Switch mode to Cool",
    callback:    actions.nt.setMode("cool"),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    alias:       "r",
    description: "Switch mode to Heat/Cool",
    callback:    actions.nt.setMode("range"),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    alias:       "o",
    description: "Switch mode to Off",
    callback:    actions.nt.setMode("off"),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    alias:       "f",
    description: "Switch fan On",
    callback:    actions.nt.setFan(1),
  },
  {
    path:        "/thermostat/DEVICE_.*",
    alias:       "F",
    description: "Switch fan Off",
    callback:    actions.nt.setFan(0),
  },
]

// Aliases
const aliases = {
  "wikipedia.org": [
    // Wikimedia sites
    "wiktionary.org",
    "wikiquote.org",
    "wikisource.org",
    "wikimedia.org",
    "mediawiki.org",
    "wikivoyage.org",
    "wikibooks.org",
    "wikinews.org",
    "wikiversity.org",
    "wikidata.org",

    // MediaWiki-powered sites
    "wiki.archlinux.org",
  ],

  "stackoverflow.com": [
    "stackexchange.com",
    "serverfault.com",
    "superuser.com",
    "askubuntu.com",
    "stackapps.com",
    "mathoverflow.net",
  ],
}

module.exports = {
  unmaps,
  maps,
  aliases,
}
