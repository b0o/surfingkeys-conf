import actions from "./actions.js"
import api from "./api.js"
import help from "./help.js"
import priv from "./conf.priv.js"
import util from "./util.js"

const { categories } = help

const { Clipboard, Front } = api

// Remove undesired default mappings
const unmaps = {
  mappings: [
    "sb",
    "sw",
    "ob",
    "oe",
    "ow",
    "oy",
    "cp",
    ";cp",
    ";ap",
    "spa",
    "spb",
    "spd",
    "sps",
    "spc",
    "spi",
    "sfr",
    "zQ",
    "zz",
    "zR",
    "ab",
    "Q",
    "q",
    "ag",
    "af",
    ";s",
    "yp",
    "p",
    "<Ctrl-j>",
    "<Ctrl-h>",
  ],
  searchAliases: {
    s: ["g", "d", "b", "e", "w", "s", "h", "y"],
  },
}

const maps = {}

maps.global = [
  {
    alias: "F",
    map: "gf",
    category: categories.mouseClick,
    description: "Open a link in non-active new tab",
  },
  {
    alias: "zf",
    category: categories.mouseClick,
    description: "Open link URL in vim editor",
    callback: actions.previewLink,
  },
  {
    alias: "w",
    map: "k",
    category: categories.scroll,
    description: "Scroll up",
  },
  {
    alias: "s",
    map: "j",
    category: categories.scroll,
    description: "Scroll down",
  },
  {
    alias: "K",
    map: "e",
    category: categories.scroll,
    description: "Scroll half page up",
  },
  {
    alias: "J",
    map: "d",
    category: categories.scroll,
    description: "Scroll half page down",
  },
  {
    alias: "gh",
    category: categories.scroll,
    description: "Scroll to element targeted by URL hash",
    callback: actions.scrollToHash,
  },
  {
    alias: "gi",
    category: categories.pageNav,
    description: "Edit current URL with vim editor",
    callback: actions.vimEditURL,
  },
  {
    alias: "gi",
    category: categories.pageNav,
    description: "Edit current URL with vim editor",
    callback: actions.vimEditURL,
  },
  {
    alias: "gI",
    category: categories.pageNav,
    description: "View image in new tab",
    callback: () => util.createHints("img", (i) => actions.openLink(i.src)),
  },
  {
    alias: "g.",
    category: categories.pageNav,
    description: "Go to parent domain",
    callback: () => {
      const subdomains = window.location.host.split(".")
      const parentDomain = (
        subdomains.length > 2 ? subdomains.slice(1) : subdomains
      ).join(".")
      actions.openLink(`${window.location.protocol}//${parentDomain}`)
    },
  },
  {
    alias: "yp",
    category: categories.clipboard,
    description: "Copy URL path of current page",
    callback: () => Clipboard.write(window.location.href),
  },
  {
    alias: "yI",
    category: categories.clipboard,
    description: "Copy Image URL",
    callback: () => util.createHints("img", (i) => Clipboard.write(i.src)),
  },
  {
    alias: "yA",
    category: categories.clipboard,
    description: "Copy link as Markdown",
    callback: () =>
      util.createHints("a[href]", (a) =>
        Clipboard.write(`[${a.innerText}](${a.href})`)
      ),
  },
  {
    alias: "yO",
    category: categories.clipboard,
    description: "Copy page URL/Title as Org-mode link",
    callback: () => Clipboard.write(actions.getOrgLink()),
  },
  {
    alias: "yM",
    category: categories.clipboard,
    description: "Copy page URL/Title as Markdown link",
    callback: () => Clipboard.write(actions.getMarkdownLink()),
  },
  {
    alias: "yT",
    category: categories.tabs,
    description: "Duplicate current tab (non-active new tab)",
    callback: () =>
      actions.openLink(window.location.href, { newTab: true, active: false }),
  },
  // TODO
  // {
  //   alias:       "yx",
  //   category:    categories.tabs,
  //   description: "Cut current tab",
  //   callback:    () => actions.cutTab(),
  // },
  // {
  //   alias:       "px",
  //   category:    categories.tabs,
  //   description: "Paste tab",
  //   callback:    () => actions.pasteTab(),
  // },
  {
    alias: ";se",
    category: categories.settings,
    description: "Edit Settings",
    callback: actions.editSettings,
  },
  {
    alias: "gS",
    category: categories.chromeURLs,
    description: "Open Chrome settings",
  },
  {
    alias: "=W",
    category: categories.misc,
    description: "Lookup whois information for domain",
    callback: () => actions.openLink(actions.getWhoisUrl(), { newTab: true }),
  },
  {
    alias: "=d",
    category: categories.misc,
    description: "Lookup dns information for domain",
    callback: () => actions.openLink(actions.getDnsInfoUrl(), { newTab: true }),
  },
  {
    alias: "=D",
    category: categories.misc,
    description: "Lookup all information for domain",
    callback: () =>
      actions.openLink(actions.getDnsInfoUrl({ all: true }), { newTab: true }),
  },
  {
    alias: "=c",
    category: categories.misc,
    description: "Show Google's cached version of page",
    callback: () =>
      actions.openLink(actions.getGoogleCacheUrl(), { newTab: true }),
  },
  {
    alias: "=a",
    category: categories.misc,
    description: "Show Archive.org Wayback Machine for page",
    callback: () => actions.openLink(actions.getWaybackUrl(), { newTab: true }),
  },
  {
    alias: "=A",
    category: categories.misc,
    description: "Show Alexa.com info for domain",
    callback: () => actions.openLink(actions.getAlexaUrl(), { newTab: true }),
  },
  {
    alias: "=s",
    category: categories.misc,
    description: "View social discussions for page",
    callback: () =>
      actions.openLink(actions.getDiscussionsUrl(), { newTab: true }),
  },
  {
    alias: "=S",
    category: categories.misc,
    description: "View summary for page",
    callback: () => actions.openLink(actions.getSummaryUrl(), { newTab: true }),
  },
  {
    alias: "=o",
    category: categories.misc,
    description: "Show outline.com version of page",
    callback: () => actions.openLink(actions.getOutlineUrl(), { newTab: true }),
  },
  {
    alias: "=bw",
    category: categories.misc,
    description: "Show BuiltWith report for page",
    callback: () =>
      actions.openLink(actions.getBuiltWithUrl(), { newTab: true }),
  },
  {
    alias: "=wa",
    category: categories.misc,
    description: "Show Wappalyzer report for page",
    callback: () =>
      actions.openLink(actions.getWappalyzerUrl(), { newTab: true }),
  },
  {
    alias: ";pd",
    category: categories.misc,
    description: "Toggle PDF viewer from SurfingKeys",
    callback: actions.togglePdfViewer,
  },
  {
    alias: "gxE",
    map: "gxt",
    category: categories.tabs,
    description: "Close tab to left",
  },
  {
    alias: "gxR",
    map: "gxT",
    category: categories.tabs,
    description: "Close tab to right",
  },
  {
    alias: "\\cgh",
    category: categories.clipboard,
    description: "Open clipboard string as GitHub path (e.g. 'torvalds/linux')",
    callback: async () => {
      const { url } = actions.gh.parseRepo(await navigator.clipboard.readText())
      Front.showBanner(`Open ${url}`)
      actions.openLink(url, { newTab: true })
    },
  },
  {
    alias: "F",
    map: "gf",
    category: categories.mouseClick,
    description: "Open a link in non-active new tab",
  },
  {
    alias: "oh",
    category: categories.omnibar,
    description: "Open URL from history",
    callback: () => Front.openOmnibar({ type: "History" }),
  },
  // {
  //   alias:       "\\A",
  //   description: "Open AWS service",
  //   callback:    actions.omnibar.aws,
  // },
]

maps["amazon.com"] = [
  {
    alias: "fs",
    description: "Fakespot",
    callback: actions.fakeSpot,
  },
  {
    alias: "a",
    description: "View product",
    callback: actions.az.viewProduct,
  },
  {
    alias: "c",
    description: "Add to Cart",
    callback: () => util.createHints("#add-to-cart-button"),
  },
  {
    alias: "R",
    description: "View Product Reviews",
    callback: () => actions.openLink("#customerReviews"),
  },
  {
    alias: "Q",
    description: "View Product Q&A",
    callback: () => actions.openLink("#Ask"),
  },
  {
    alias: "A",
    description: "Open Account page",
    callback: () => actions.openLink("/gp/css/homepage.html"),
  },
  {
    alias: "C",
    description: "Open Cart page",
    callback: () => actions.openLink("/gp/cart/view.html"),
  },
  {
    alias: "O",
    description: "Open Orders page",
    callback: () => actions.openLink("/gp/css/order-history"),
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
  ".X5OiLe",
  ".WlydOe",
  ".fl",
].join(",")

maps["www.google.com"] = [
  {
    alias: "a",
    description: "Open search result",
    callback: () => util.createHints(googleSearchResultSelector),
  },
  {
    alias: "A",
    description: "Open search result (new tab)",
    callback: () =>
      util.createHints(
        googleSearchResultSelector,
        actions.openAnchor({ newTab: true, active: false })
      ),
  },
  {
    alias: "d",
    description: "Open search in DuckDuckGo",
    callback: actions.go.ddg,
  },
]

maps["algolia.com"] = [
  {
    alias: "a",
    description: "Open search result",
    callback: () => util.createHints(".item-main h2>a:first-child"),
  },
]

const ddgSelector = [
  "a[rel=noopener][target=_self]:not([data-testid=result-extras-url-link])",
  ".js-images-show-more",
  ".module--images__thumbnails__link",
  ".tile--img__sub",
].join(",")

maps["duckduckgo.com"] = [
  {
    alias: "a",
    description: "Open search result",
    callback: () => util.createHints(ddgSelector),
  },
  {
    alias: "A",
    description: "Open search result (non-active new tab)",
    callback: () =>
      util.createHints(
        ddgSelector,
        actions.openAnchor({ newTab: true, active: false })
      ),
  },
  {
    leader: "",
    alias: "]]",
    description: "Show more results",
    callback: () => document.querySelector(".result--more__btn").click(),
  },
  {
    alias: "g",
    description: "Open search in Google",
    callback: actions.dg.goog,
  },
  {
    alias: "sgh",
    description: "Search site:github.com",
    callback: () => actions.dg.siteSearch("github.com"),
  },
  {
    alias: "sre",
    description: "Search site:reddit.com",
    callback: () => actions.dg.siteSearch("reddit.com"),
  },
]

maps["www.yelp.com"] = [
  {
    alias: "fs",
    description: "Fakespot",
    callback: actions.fakeSpot,
  },
]

maps["youtube.com"] = [
  {
    leader: "",
    alias: "A",
    description: "Open video",
    callback: () =>
      util.createHints(
        "*[id='video-title']",
        actions.openAnchor({ newTab: true })
      ),
  },
  {
    leader: "",
    alias: "C",
    description: "Open channel",
    callback: () => util.createHints("*[id='byline']"),
  },
  {
    leader: "",
    alias: "gH",
    description: "Goto homepage",
    callback: () =>
      actions.openLink("https://www.youtube.com/feed/subscriptions?flow=2"),
  },
  {
    leader: "",
    alias: "F",
    description: "Toggle fullscreen",
    callback: () =>
      actions.dispatchMouseEvents(
        document.querySelector("#movie_player.ytp-fullscreen-button"),
        "mousedown",
        "click"
      ),
  },
  {
    leader: "",
    alias: "Yt",
    description: "Copy YouTube video link for current time",
    callback: () => Clipboard.write(actions.yt.getCurrentTimestampLink()),
  },
  {
    leader: "",
    alias: "Ym",
    description: "Copy YouTube video markdown link for current time",
    callback: () =>
      Clipboard.write(actions.yt.getCurrentTimestampMarkdownLink()),
  },
]

maps["vimeo.com"] = [
  {
    alias: "F",
    description: "Toggle fullscreen",
    callback: () => document.querySelector(".fullscreen-icon").click(),
  },
]

maps["github.com"] = [
  {
    alias: "A",
    description: "Open repository Actions page",
    callback: () => actions.gh.openRepoPage("/actions"),
  },
  {
    alias: "C",
    description: "Open repository Commits page",
    callback: () => actions.gh.openRepoPage("/commits"),
  },
  {
    alias: "I",
    description: "Open repository Issues page",
    callback: () => actions.gh.openRepoPage("/issues"),
  },
  {
    alias: "N",
    description: "Open notifications page",
    callback: () => actions.gh.openPage("/notifications"),
  },
  {
    alias: "P",
    description: "Open repository Pull Requests page",
    callback: () => actions.gh.openRepoPage("/pulls"),
  },
  {
    alias: "R",
    description: "Open Repository page",
    callback: () => actions.gh.openRepoPage("/"),
  },
  {
    alias: "S",
    description: "Open repository Settings page",
    callback: () => actions.gh.openRepoPage("/settings"),
  },
  {
    alias: "W",
    description: "Open repository Wiki page",
    callback: () => actions.gh.openRepoPage("/wiki"),
  },
  {
    alias: "X",
    description: "Open repository Security page",
    callback: () => actions.gh.openRepoPage("/security"),
  },
  {
    alias: "O",
    description: "Open repository Owner's profile page",
    callback: actions.gh.openRepoOwner,
  },
  {
    alias: "M",
    description: "Open your profile page ('Me')",
    callback: actions.gh.openProfile,
  },
  {
    alias: "a",
    description: "View Repository",
    callback: actions.gh.openRepo,
  },
  {
    alias: "u",
    description: "View User",
    callback: actions.gh.openUser,
  },
  {
    alias: "f",
    description: "View File",
    callback: actions.gh.openFile,
  },
  {
    alias: "c",
    description: "View Commit",
    callback: actions.gh.openCommit,
  },
  {
    alias: "i",
    description: "View Issue",
    callback: actions.gh.openIssue,
  },
  {
    alias: "p",
    description: "View Pull Request",
    callback: actions.gh.openPull,
  },
  {
    alias: "e",
    description: "View external link",
    callback: () => util.createHints("a[rel=nofollow]"),
  },
  {
    // TODO: Add repetition support: 3gu
    leader: "",
    alias: "gu",
    description: "Go up one path in the URL (GitHub)",
    callback: actions.gh.goParent,
  },
  {
    alias: "s",
    description: "Toggle Star",
    callback: actions.gh.star({ toggle: true }),
  },
  {
    alias: "yy",
    description: "Copy Project Path",
    callback: async () => Clipboard.write(util.getURLPath({ count: 2 })),
  },
  {
    alias: "Y",
    description: "Copy Project Path (including domain)",
    callback: () =>
      Clipboard.write(util.getURLPath({ count: 2, domain: true })),
  },
  {
    alias: "l",
    description: "Toggle repo language stats",
    callback: actions.gh.toggleLangStats,
  },
  {
    alias: "D",
    description: "Open in github.dev (new tab)",
    callback: () => actions.gh.openInDev({ newTab: true }),
  },
  {
    alias: "dd",
    description: "Open in github.dev",
    callback: actions.gh.openInDev,
  },
  {
    alias: "G",
    description: "View on SourceGraph",
    callback: actions.gh.viewSourceGraph,
  },
  {
    alias: "r",
    description: "View live raw version of file",
    callback: () =>
      actions.gh
        .selectFile({ directories: false })
        .then((file) => actions.openLink(file.rawUrl, { newTab: true })),
  },
  {
    alias: "yr",
    description: "Copy raw link to file",
    callback: () =>
      actions.gh
        .selectFile({ directories: false })
        .then((file) => Clipboard.write(file.rawUrl)),
  },
  {
    alias: "yf",
    description: "Copy link to file",
    callback: () =>
      actions.gh.selectFile().then((file) => Clipboard.write(file.url)),
  },
  {
    alias: "gcp",
    description: "Open clipboard string as file path in repo",
    callback: actions.gh.openFileFromClipboard,
  },
]

maps["raw.githubusercontent.com"] = [
  {
    alias: "R",
    description: "Open Repository page",
    callback: () => actions.gh.openRepoPage("/"),
  },
  {
    alias: "F",
    description: "Open Source File",
    callback: actions.gh.openSourceFile,
  },
]

maps["github.io"] = [
  {
    alias: "R",
    description: "Open Repository page",
    callback: () => actions.gh.openGithubPagesRepo(),
  },
]

maps["gitlab.com"] = [
  {
    alias: "s",
    description: "Toggle Star",
    callback: actions.gl.star,
  },
  {
    alias: "y",
    description: "Copy Project Path",
    callback: () => Clipboard.write(util.getURLPath({ count: 2 })),
  },
  {
    alias: "Y",
    description: "Copy Project Path (including domain)",
    callback: () =>
      Clipboard.write(util.getURLPath({ count: 2, domain: true })),
  },
  {
    alias: "D",
    description: "View GoDoc for Project",
    callback: actions.viewGodoc,
  },
]

maps["twitter.com"] = [
  {
    alias: "f",
    description: "Follow user",
    callback: () =>
      util.createHints("div[role='button'][data-testid$='follow']"),
  },
  {
    alias: "s",
    description: "Like tweet",
    callback: () => util.createHints("div[role='button'][data-testid$='like']"),
  },
  {
    alias: "R",
    description: "Retweet",
    callback: () =>
      util.createHints("div[role='button'][data-testid$='retweet']"),
  },
  {
    alias: "c",
    description: "Comment/Reply",
    callback: () => util.createHints("div[role='button'][data-testid='reply']"),
  },
  {
    alias: "T",
    description: "New tweet",
    callback: () =>
      document
        .querySelector(
          "a[role='button'][data-testid='SideNav_NewTweet_Button']"
        )
        .click(),
  },
  {
    alias: "u",
    description: "Goto user",
    callback: actions.tw.openUser,
  },
  {
    alias: "t",
    description: "Goto tweet",
    callback: () =>
      util.createHints(
        "article, article div[data-focusable='true'][role='link'][tabindex='0']"
      ),
  },
]

maps["bsky.app"] = [
  {
    alias: "d",
    description: "Copy user DID",
    callback: actions.by.copyDID,
  },
  {
    alias: "p",
    description: "Copy user post ID",
    callback: actions.by.copyPostID,
  },
]


maps["reddit.com"] = [
  {
    alias: "x",
    description: "Collapse comment",
    callback: () => util.createHints(".expand"),
  },
  {
    alias: "X",
    description: "Collapse next comment",
    callback: actions.re.collapseNextComment,
  },
  {
    alias: "s",
    description: "Upvote",
    callback: () => util.createHints(".arrow.up"),
  },
  {
    alias: "S",
    description: "Downvote",
    callback: () => util.createHints(".arrow.down"),
  },
  {
    alias: "e",
    description: "Expand expando",
    callback: () => util.createHints(".expando-button"),
  },
  {
    alias: "a",
    description: "View post (link)",
    callback: () => util.createHints(".title"),
  },
  {
    alias: "A",
    description: "View post (link) (non-active new tab)",
    callback: () =>
      util.createHints(
        ".title",
        actions.openAnchor({ newTab: true, active: false })
      ),
  },
  {
    alias: "c",
    description: "View post (comments)",
    callback: () => util.createHints(".comments"),
  },
  {
    alias: "C",
    description: "View post (comments) (non-active new tab)",
    callback: () =>
      util.createHints(
        ".comments",
        actions.openAnchor({ newTab: true, active: false })
      ),
  },
]

maps["news.ycombinator.com"] = [
  {
    alias: "x",
    description: "Collapse comment",
    callback: () => util.createHints(".togg"),
  },
  {
    alias: "X",
    description: "Collapse next comment",
    callback: actions.hn.collapseNextComment,
  },
  {
    alias: "s",
    description: "Upvote",
    callback: () => util.createHints(".votearrow[title='upvote']"),
  },
  {
    alias: "S",
    description: "Downvote",
    callback: () => util.createHints(".votearrow[title='downvote']"),
  },
  {
    alias: "a",
    description: "View post (link)",
    callback: () => util.createHints(".titleline>a"),
  },
  {
    alias: "A",
    description: "View post (link and comments)",
    callback: () => util.createHints(".athing", actions.hn.openLinkAndComments),
  },
  {
    alias: "c",
    description: "View post (comments)",
    callback: () => util.createHints(".subline>a[href^='item']"),
  },
  {
    alias: "C",
    description: "View post (comments) (non-active new tab)",
    callback: () =>
      util.createHints(
        ".subline>a[href^='item']",
        actions.openAnchor({ newTab: true, active: false })
      ),
  },
  {
    alias: "e",
    description: "View external link",
    callback: () => util.createHints("a[rel=nofollow]"),
  },
  {
    leader: "",
    alias: "gp",
    description: "Go to parent",
    callback: actions.hn.goParent,
  },
  {
    leader: "",
    alias: "]]",
    description: "Next page",
    callback: () => actions.hn.goPage(1),
  },
  {
    leader: "",
    alias: "[[",
    description: "Prev page",
    callback: () => actions.hn.goPage(-1),
  },
]

maps["producthunt.com"] = [
  {
    alias: "a",
    description: "View product (external)",
    callback: actions.ph.openExternal,
  },
  {
    alias: "v",
    description: "View product",
    callback: () =>
      util.createHints(
        "ul[class^='postsList_'] > li > div[class^='item_'] > a"
      ),
  },
  {
    alias: "s",
    description: "Upvote product",
    callback: () => util.createHints("button[data-test='vote-button']"),
  },
]

maps["behance.net"] = [
  {
    alias: "s",
    description: "Appreciate project",
    callback: () => util.createHints(".appreciation-button"),
  },
  {
    alias: "b",
    description: "Add project to collection",
    callback: () => document.querySelector(".qa-action-collection").click(),
  },
  {
    alias: "a",
    description: "View project",
    callback: () => util.createHints(".rf-project-cover__title"),
  },
  {
    alias: "A",
    description: "View project (non-active new tab)",
    callback: () =>
      util.createHints(
        ".rf-project-cover__title",
        actions.openAnchor({ newTab: true, active: false })
      ),
  },
]

maps["fonts.adobe.com"] = [
  {
    alias: "a",
    description: "Activate font",
    callback: () => util.createHints(".spectrum-ToggleSwitch-input"),
  },
  {
    alias: "s",
    description: "Favorite font",
    callback: () => util.createHints(".favorite-toggle-icon"),
  },
]

maps["wikipedia.org"] = [
  {
    alias: "s",
    description: "Toggle simple version of current article",
    callback: actions.wp.toggleSimple,
  },
  {
    alias: "a",
    description: "View page",
    callback: () =>
      util.createHints(
        "#bodyContent :not(sup):not(.mw-editsection) > a:not([rel=nofollow])"
      ),
  },
  {
    alias: "e",
    description: "View external link",
    callback: () => util.createHints("a[rel=nofollow]"),
  },
  {
    alias: "ys",
    description: "Copy article summary as Markdown",
    callback: () => Clipboard.write(actions.wp.markdownSummary()),
  },
  {
    alias: "R",
    description: "View WikiRank for current article",
    callback: actions.wp.viewWikiRank,
  },
]

maps["craigslist.org"] = [
  {
    alias: "a",
    description: "View listing",
    callback: () => util.createHints("a.result-title"),
  },
]

maps["stackoverflow.com"] = [
  {
    alias: "a",
    description: "View question",
    callback: () => util.createHints("a.question-hyperlink"),
  },
]

maps["aur.archlinux.org"] = [
  {
    alias: "a",
    description: "View package",
    callback: () => util.createHints("a[href^='/packages/'][href$='/']"),
  },
]

maps["home.nest.com"] = [
  {
    path: "/thermostat/DEVICE_.*",
    leader: "",
    alias: "=",
    description: "Increment temperature",
    callback: () => actions.nt.adjustTemp(1),
  },
  {
    path: "/thermostat/DEVICE_.*",
    leader: "",
    alias: "-",
    description: "Decrement temperature",
    callback: () => actions.nt.adjustTemp(-1),
  },
  {
    path: "/thermostat/DEVICE_.*",
    alias: "h",
    description: "Switch mode to Heat",
    callback: () => actions.nt.setMode("heat"),
  },
  {
    path: "/thermostat/DEVICE_.*",
    alias: "c",
    description: "Switch mode to Cool",
    callback: () => actions.nt.setMode("cool"),
  },
  {
    path: "/thermostat/DEVICE_.*",
    alias: "r",
    description: "Switch mode to Heat/Cool",
    callback: () => actions.nt.setMode("range"),
  },
  {
    path: "/thermostat/DEVICE_.*",
    alias: "o",
    description: "Switch mode to Off",
    callback: () => actions.nt.setMode("off"),
  },
  {
    path: "/thermostat/DEVICE_.*",
    alias: "f",
    description: "Switch fan On",
    callback: () => actions.nt.setFan(1),
  },
  {
    path: "/thermostat/DEVICE_.*",
    alias: "F",
    description: "Switch fan Off",
    callback: () => actions.nt.setFan(0),
  },
]

const rescriptMeta = {
  docsPat: "/docs(/.*)?",
}

maps["rescript-lang.org"] = [
  // Links / elements
  {
    leader: "",
    alias: "i",
    description: "Focus search field",
    path: `(${rescriptMeta.docsPat})?$`,
    callback: actions.re.focusSearch,
  },
  {
    alias: "a",
    description: "Open docs link",
    path: rescriptMeta.docsPat,
    callback: () => util.createHints("a[href^='/docs/']"),
  },

  // Shorcuts
  {
    alias: "L",
    description: "Open language manual",
    callback: () => actions.openLink("/docs/manual/latest/introduction"),
  },
  {
    alias: "R",
    description: "Open ReScript + React docs",
    callback: () => actions.openLink("/docs/react/latest/introduction"),
  },
  {
    alias: "G",
    description: "Open GenType docs",
    callback: () => actions.openLink("/docs/gentype/latest/introduction"),
  },
  {
    alias: "P",
    description: "Open package index",
    callback: () => actions.openLink("/packages"),
  },
  {
    alias: "Y",
    description: "Open playground",
    callback: () => actions.openLink("/try"),
  },
  {
    alias: "S",
    description: "Open syntax lookup",
    callback: () => actions.openLink("/syntax-lookup"),
  },
  {
    alias: "F",
    description: "Open community forum",
    callback: () => actions.openLink("https://forum.rescript-lang.org/"),
  },
  {
    alias: "A",
    description: "Open API docs",
    callback: () => actions.openLink("/docs/manual/latest/api"),
  },
  {
    alias: "J",
    description: "Open JS API docs",
    callback: () => actions.openLink("/docs/manual/latest/api/js"),
  },
  {
    alias: "B",
    description: "Open Belt API docs",
    callback: () => actions.openLink("/docs/manual/latest/api/belt"),
  },
  {
    alias: "D",
    description: "Open DOM API docs",
    callback: () => actions.openLink("/docs/manual/latest/api/dom"),
  },

  // Scroll
  {
    leader: "",
    alias: "w",
    description: "Scroll sidebar up",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollSidebar("up"),
  },
  {
    leader: "",
    alias: "s",
    description: "Scroll sidebar down",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollSidebar("down"),
  },
  {
    leader: "",
    alias: "e",
    description: "Scroll sidebar page up",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollSidebar("pageUp"),
  },
  {
    leader: "",
    alias: "d",
    description: "Scroll sidebar page down",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollSidebar("pageDown"),
  },
  {
    leader: "",
    alias: "k",
    description: "Scroll body up",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollContent("up"),
  },
  {
    leader: "",
    alias: "j",
    description: "Scroll body down",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollContent("down"),
  },
  {
    leader: "",
    alias: "K",
    description: "Scroll body page up",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollContent("pageUp"),
  },
  {
    leader: "",
    alias: "J",
    description: "Scroll body page down",
    path: rescriptMeta.docsPat,
    callback: () => actions.re.scrollContent("pageDown"),
  },
]

maps["devdocs.io"] = [
  {
    leader: "",
    alias: "w",
    description: "Scroll sidebar up",
    callback: () => actions.dv.scrollSidebar("up"),
  },
  {
    leader: "",
    alias: "s",
    description: "Scroll sidebar down",
    callback: () => actions.dv.scrollSidebar("down"),
  },
  {
    leader: "",
    alias: "e",
    description: "Scroll sidebar page up",
    callback: () => actions.dv.scrollSidebar("pageUp"),
  },
  {
    leader: "",
    alias: "d",
    description: "Scroll sidebar page down",
    callback: () => actions.dv.scrollSidebar("pageDown"),
  },
  {
    leader: "",
    alias: "k",
    description: "Scroll body up",
    callback: () => actions.dv.scrollContent("up"),
  },
  {
    leader: "",
    alias: "j",
    description: "Scroll body down",
    callback: () => actions.dv.scrollContent("down"),
  },
  {
    leader: "",
    alias: "K",
    description: "Scroll body page up",
    callback: () => actions.dv.scrollContent("pageUp"),
  },
  {
    leader: "",
    alias: "J",
    description: "Scroll body page down",
    callback: () => actions.dv.scrollContent("pageDown"),
  },
]

maps["ebay.com"] = [
  {
    alias: "fs",
    description: "Fakespot",
    callback: actions.fakeSpot,
  },
]

maps["ikea.com"] = [
  {
    alias: "d",
    description: "Toggle Product Details",
    callback: () => actions.ik.toggleProductDetails(),
  },
  {
    alias: "i",
    description: "Toggle Product Details",
    callback: () => actions.ik.toggleProductDetails(),
  },
  {
    alias: "r",
    description: "Toggle Product Reviews",
    callback: () => actions.ik.toggleProductReviews(),
  },
  {
    alias: "C",
    description: "Open Cart page",
    callback: () => actions.openLink("/us/en/shoppingcart/"),
  },
  {
    alias: "P",
    description: "Open Profile page",
    callback: () => actions.openLink("/us/en/profile/login/"),
  },
  {
    alias: "F",
    description: "Open Favorites page",
    callback: () => actions.openLink("/us/en/favorites/"),
  },
  {
    alias: "O",
    description: "Open Orders page",
    callback: () =>
      actions.openLink("/us/en/customer-service/track-manage-order/"),
  },
]

maps["chat.openai.com"] = [
  {
    alias: "n",
    description: "New chat",
    callback: () => actions.cg.newChat(),
  },
  {
    alias: "a",
    description: "Open chat",
    callback: () => util.createHints([...actions.cg.getChatLinks()]),
  },
]

const registerDOI = (
  domain,
  provider = actions.doi.providers.meta_citation_doi
) => {
  if (!maps[domain]) {
    maps[domain] = []
  }
  maps[domain].push({
    alias: "O",
    description: "Open DOI",
    callback: () => {
      const url = actions.doi.getLink(provider)
      if (url) {
        actions.openLink(url, { newTab: true })
      }
    },
    hide: true,
  })
}

if (priv.doi_handler) {
  registerDOI("aaai.org")
  registerDOI("academic.oup.com")
  registerDOI("aeaweb.org")
  registerDOI("aging-us.com")
  registerDOI("ahajournals.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("ajnr.org")
  registerDOI("annualreviews.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("apa.org", () =>
    document
      .querySelector(".citation a")
      ?.innerText?.replace(/^https:\/\/doi\.org\//, "")
  )
  registerDOI("ashpublications.org")
  registerDOI("asnjournals.org")
  registerDOI("biomedcentral.com")
  registerDOI("bmj.com")
  registerDOI("brill.com")
  registerDOI("cambridge.org")
  registerDOI("cell.com")
  registerDOI("cmaj.ca")
  registerDOI("cochranelibrary.com")
  registerDOI("diabetesjournals.org")
  registerDOI("direct.mit.edu")
  registerDOI("dl.acm.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("elifesciences.org", () =>
    document
      .querySelector("meta[name='dc.identifier']")
      ?.content?.replace(/^doi:/, "")
  )
  registerDOI("embopress.org")
  registerDOI("emerald.com", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("episciences.org")
  registerDOI("epubs.siam.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("ersjournals.com")
  registerDOI("europepmc.org")
  registerDOI("frontiersin.org")
  registerDOI("future-science.com", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("go.gale.com")
  registerDOI(
    "ieee.org",
    () => document.querySelector(".stats-document-abstract-doi a")?.innerText
  )
  registerDOI("ingentaconnect.com", () =>
    document
      .querySelector("meta[name='DC.identifier']")
      ?.content?.replace(/^info:doi\//, "")
  )
  registerDOI("jacc.or", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("jamanetwork.com")
  registerDOI("jci.org")
  registerDOI("jfdc.cnic.cn")
  registerDOI("jlr.org")
  registerDOI("jneurosci.org")
  registerDOI("journals.lww.com")
  registerDOI(
    "journals.physiology.org",
    actions.doi.providers.meta_dcIdentifier_doi
  )
  registerDOI("journals.plos.org")
  registerDOI(
    "journals.sagepub.com",
    actions.doi.providers.meta_dcIdentifier_doi
  )
  registerDOI(
    "journals.uchicago.edu",
    actions.doi.providers.meta_dcIdentifier_doi
  )
  registerDOI("jst.go.jp")
  registerDOI("karger.com")
  registerDOI("koreascience.kr")
  registerDOI("koreascience.or.kr")
  registerDOI("liebertpub.com", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("mdpi.com")
  registerDOI(
    "msp.org",
    () => document.querySelector(".paper-doi a")?.innerText
  )
  registerDOI("nature.com")
  registerDOI("nejm.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("nowpublishers.com")
  registerDOI("nsf.gov")
  registerDOI("ocl-journal.org")
  registerDOI("onlinelibrary.wiley.com")
  registerDOI("pnas.org")
  registerDOI("ncbi.nlm.nih.gov")
  registerDOI("pubs.acs.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("pubs.geoscienceworld.org")
  registerDOI("pubs.rsna.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("research.manchester.ac.uk")
  registerDOI(
    "royalsocietypublishing.org",
    actions.doi.providers.meta_dcIdentifier_doi
  )
  registerDOI("rupress.org")
  registerDOI("science.org", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("sciencedirect.com")
  registerDOI("scitation.org")
  registerDOI("spandidos-publications.com")
  registerDOI("spiedigitallibrary.org")
  registerDOI("springer.com")
  registerDOI("synapse.koreamed.org")
  registerDOI("tandfonline.com", actions.doi.providers.meta_dcIdentifier_doi)
  registerDOI("thelancet.com")
  registerDOI(
    "worldscientific.com",
    actions.doi.providers.meta_dcIdentifier_doi
  )
}

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

export default {
  unmaps,
  maps,
  aliases,
}
