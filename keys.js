const actions = require("./actions")
const { categories } = require("./help")

// Remove undesired default mappings
const unmaps = {
  mappings: [
    "sb", "sw", "ob",
    "ow", "cp", ";cp",
    ";ap", "spa", "spb",
    "spd", "sps", "spc",
    "sfr", "ab", "Q", "q",
    "af", ";s", "yp",
    "<Ctrl-j>", "<Ctrl-h>",
  ],
  searchAliases: {
    s: ["g", "d", "b",
      "w", "s", "h"],
  },
}

const maps = {
  global: [
    {
      alias:       "F",
      map:         "gf",
      category:    categories.mouseClick,
      description: "Open a link in non-active new tab",
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
      callback:    actions.createHint("img", i => actions.openLink(i.src)()),
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
      callback:    actions.createHint("img", i => Clipboard.write(i.src)),
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
  ],

  "amazon.com": [
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
  ],

  "www.google.com": [
    {
      alias:       "a",
      description: "Open search result",
      callback:    actions.createHint("a.fl, .r>a"),
    },
    {
      alias:       "A",
      description: "Open search result (non-active new tab)",
      callback:    actions.createHint("a.fl, .r>a", actions.openAnchor({ newTab: true, active: false })),
    },
  ],


  "duckduckgo.com": [
    {
      alias:       "a",
      description: "Open search result",
      callback:    actions.createHint(".result__a"),
    },
    {
      alias:       "A",
      description: "Open search result (non-active new tab)",
      callback:    actions.createHint(".result__a", actions.openAnchor({ newTab: true, active: false })),
    },
  ],


  "yelp.com": [
    {
      alias:       "fs",
      description: "Fakespot",
      callback:    actions.fakeSpot,
    },
  ],

  "youtube.com": [
    {
      leader:      "",
      alias:       "A",
      description: "Open video",
      callback:    actions.createHint("*[id='video-title']", actions.openAnchor({ newTab: true })),
    },
    {
      leader:      "",
      alias:       "C",
      description: "Open channel",
      callback:    actions.createHint("*[id='byline']"),
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
    {
      leader:      "",
      alias:       "<Space>",
      description: "Play/pause",
      callback:    actions.createHint(".ytp-play-button"),
    },
  ],

  "vimeo.com": [
    {
      alias:       "F",
      description: "Toggle fullscreen",
      callback:    () => document.querySelector(".fullscreen-icon").click(),
    },
  ],

  "github.com": [
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
      leader:      "",
      alias:       "gp",
      description: "Go to parent",
      callback:    actions.gh.goParent,
    },
    {
      alias:       "s",
      description: "Toggle Star",
      callback:    actions.gh.star({ toggle: true }),
    },
    {
      alias:       "S",
      description: "Check Star",
      callback:    actions.gh.star({ toggle: false }),
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
      alias:       "l",
      description: "Toggle repo language stats",
      callback:    actions.gh.toggleLangStats,
    },
    {
      alias:       "D",
      description: "View GoDoc for Project",
      callback:    actions.viewGodoc,
    },
  ],

  "gitlab.com": [
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
  ],

  "twitter.com": [
    {
      alias:       "f",
      description: "Follow user",
      callback:    actions.createHint(".follow-button"),
    },
    {
      alias:       "s",
      description: "Like tweet",
      callback:    actions.createHint(".js-actionFavorite"),
    },
    {
      alias:       "R",
      description: "Retweet",
      callback:    actions.createHint(".js-actionRetweet"),
    },
    {
      alias:       "c",
      description: "Comment/Reply",
      callback:    actions.createHint(".js-actionReply"),
    },
    {
      alias:       "t",
      description: "New tweet",
      callback:    actions.createHint(".js-global-new-tweet"),
    },
    {
      alias:       "T",
      description: "Tweet to",
      callback:    actions.createHint(".NewTweetButton"),
    },
    {
      alias:       "r",
      description: "Load new tweets",
      callback:    actions.createHint(".new-tweets-bar"),
    },
    {
      alias:       "g",
      description: "Goto user",
      callback:    actions.createHint(".js-user-profile-link"),
    },
  ],

  "reddit.com": [
    {
      alias:       "x",
      description: "Collapse comment",
      callback:    actions.createHint(".expand"),
    },
    {
      alias:       "X",
      description: "Collapse next comment",
      callback:    actions.re.collapseNextComment,
    },
    {
      alias:       "s",
      description: "Upvote",
      callback:    actions.createHint(".arrow.up"),
    },
    {
      alias:       "S",
      description: "Downvote",
      callback:    actions.createHint(".arrow.down"),
    },
    {
      alias:       "e",
      description: "Expand expando",
      callback:    actions.createHint(".expando-button"),
    },
    {
      alias:       "a",
      description: "View post (link)",
      callback:    actions.createHint(".title"),
    },
    {
      alias:       "A",
      description: "View post (link) (non-active new tab)",
      callback:    actions.createHint(".title", actions.openAnchor({ newTab: true, active: false })),
    },
    {
      alias:       "c",
      description: "View post (comments)",
      callback:    actions.createHint(".comments"),
    },
    {
      alias:       "C",
      description: "View post (comments) (non-active new tab)",
      callback:    actions.createHint(".comments", actions.openAnchor({ newTab: true, active: false })),
    },
  ],

  "news.ycombinator.com": [
    {
      alias:       "x",
      description: "Collapse comment",
      callback:    actions.createHint(".togg"),
    },
    {
      alias:       "X",
      description: "Collapse next comment",
      callback:    actions.hn.collapseNextComment,
    },
    {
      alias:       "s",
      description: "Upvote",
      callback:    actions.createHint(".votearrow[title='upvote']"),
    },
    {
      alias:       "S",
      description: "Downvote",
      callback:    actions.createHint(".votearrow[title='downvote']"),
    },
    {
      alias:       "a",
      description: "View post (link)",
      callback:    actions.createHint(".storylink"),
    },
    {
      alias:       "A",
      description: "View post (link and comments)",
      callback:    actions.createHint(".athing", actions.hn.openLinkAndComments),
    },
    {
      alias:       "c",
      description: "View post (comments)",
      callback:    actions.createHint("td > a[href*='item']:not(.storylink)"),
    },
    {
      alias:       "C",
      description: "View post (comments) (non-active new tab)",
      callback:    actions.createHint("td > a[href*='item']:not(.storylink)", actions.openAnchor({ newTab: true, active: false })),
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
  ],

  "producthunt.com": [
    {
      alias:       "a",
      description: "View product (external)",
      callback:    actions.ph.openExternal,
    },
    {
      alias:       "v",
      description: "View product",
      callback:    actions.createHint("ul[class^='postsList_'] > li > div[class^='item_'] > a"),
    },
    {
      alias:       "s",
      description: "Upvote product",
      callback:    actions.createHint("button[data-test='vote-button']"),
    },
  ],

  "dribbble.com": [
    {
      alias:       "s",
      description: "Heart Shot",
      callback:    actions.createHint(".toggle-fav, .like-shot"),
    },
    {
      alias:       "a",
      description: "View shot",
      callback:    actions.createHint(".dribbble-over, .gif-target, .more-thumbs a"),
    },
    {
      alias:       "A",
      description: "View shot (non-active new tab)",
      callback:    actions.createHint(".dribbble-over, .gif-target, .more-thumbs a", actions.openAnchor({ newTab: true, active: false })),
    },
    {
      alias:       "v",
      description: "View attachment image",
      callback:    actions.dr.attachment(),
    },
    {
      alias:       "V",
      description: "Yank attachment image source URL",
      callback:    actions.dr.attachment(a => Clipboard.write(a)),
    },
    {
      alias:       "z",
      description: "Zoom shot",
      callback:    actions.createHint(".single-img picture, .detail-shot img"),
    },
  ],

  "behance.net": [
    {
      alias:       "s",
      description: "Appreciate project",
      callback:    actions.createHint(".appreciation-button"),
    },
    {
      alias:       "b",
      description: "Add project to collection",
      callback:    () => document.querySelector(".qa-action-collection").click(),
    },
    {
      alias:       "a",
      description: "View project",
      callback:    actions.createHint(".rf-project-cover__title"),
    },
    {
      alias:       "A",
      description: "View project (non-active new tab)",
      callback:    actions.createHint(".rf-project-cover__title", actions.openAnchor({ newTab: true, active: false })),
    },
  ],

  "fonts.adobe.com": [
    {
      alias:       "a",
      description: "Activate font",
      callback:    actions.createHint(".spectrum-ToggleSwitch-input"),
    },
    {
      alias:       "s",
      description: "Favorite font",
      callback:    actions.createHint(".favorite-toggle-icon"),
    },
  ],

  "wikipedia.org": [
    {
      alias:       "s",
      description: "Toggle simple version of current article",
      callback:    actions.wp.toggleSimple,
    },
    {
      alias:       "a",
      description: "View page",
      callback:    actions.createHint("#bodyContent :not(sup):not(.mw-editsection) > a"),
    },
  ],
}

// Aliases
maps["en.wiktionary.org"] = maps["wikipedia.org"]

module.exports = { unmaps, maps }
