const completions = require("./completions")

// Unmap undesired defaults
const unmaps = [
  "sb", "sw", "ob",
  "ow", "cp", ";cp",
  ";ap", "spa", "spb",
  "spd", "sps", "spc",
  "spi", "sfr", "zQ",
  "zz", "zR", "ab",
  "Q", "q", "ag",
  "af", ";s", "yp",
]

unmaps.forEach((u) => {
  unmap(u)
})

const rmSearchAliases =
  {
    s: ["g", "d", "b",
      "w", "s", "h"],
  }

Object.keys(rmSearchAliases).forEach((k) => {
  rmSearchAliases[k].forEach((v) => {
    removeSearchAliasX(v, k)
  })
})

// ---- Settings ----//
settings.hintAlign = "left"
settings.omnibarSuggestionTimeout = 500
settings.hintGroups = true
// settings.hintGroupStart = "middle";
settings.richHintsForKeystroke = 1

// ---- Theme ----//
settings.theme = `
    /* Disable RichHints CSS animation */
    .expandRichHints {
        animation: 0s ease-in-out 1 forwards expandRichHints;
    }
    .collapseRichHints {
        animation: 0s ease-in-out 1 forwards collapseRichHints;
    }
`

// ---- Maps ----//
// Left-hand aliases
// Movement
map("w", "k")
map("s", "j")

// Right-hand aliases
// Tab Navigation
map("J", "E")
map("K", "R")

// History
map("H", "S")
map("L", "D")


// ---- Functions ----//

const vimEditURL = () => Front
  .showEditor(window.location.href, (data) => {
    window.location.href = data
  }, "url")

const domainDossier = "http://centralops.net/co/DomainDossier.aspx"

const whois = () =>
  tabOpenLink(`${domainDossier}?dom_whois=true&addr=${window.location.hostname}`)

const dns = () =>
  tabOpenLink(`${domainDossier}?dom_dns=true&addr=${window.location.hostname}`)

const dnsVerbose = () =>
  tabOpenLink(`${domainDossier}?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true&addr=${window.location.hostname}`)

const togglePdfViewer = () =>
  chrome.storage.local.get("noPdfViewer", (resp) => {
    if (!resp.noPdfViewer) {
      chrome.storage.local.set({ noPdfViewer: 1 }, () => {
        Front.showBanner("PDF viewer disabled.")
      })
    } else {
      chrome.storage.local.remove("noPdfViewer", () => {
        Front.showBanner("PDF viewer enabled.")
      })
    }
  })

const getURLPath = (count, domain) => {
  let path = window.location.pathname.slice(1)
  if (count) {
    path = path.split("/").slice(0, count).join("/")
  }
  if (domain) {
    path = `${window.location.hostname}/${path}`
  }
  return path
}

const copyURLPath = (count, domain) => () => Clipboard.write(getURLPath(count, domain))

const editSettings = () => tabOpenLink("/pages/options.html")

const Hint = (selector, action = Hints.dispatchMouseClick) => () => Hints.create(selector, action)

// ---- Mapkeys ----//
const ri = { repeatIgnore: true }

// --- Global mappings ---//
//  0: Help
//  1: Mouse Click
//  2: Scroll Page / Element
//  3: Tabs
//  4: Page Navigation
mapkey("gi", "#4Edit current URL with vim editor", vimEditURL, ri)
mapkey("gI", "#4View image in new tab", Hint("img", i => tabOpenLink(i.src)), ri)
//  5: Sessions
//  6: Search selected with
//  7: Clipboard
mapkey("yp", "#7Copy URL path of current page", copyURLPath(), ri)
mapkey("yI", "#7Copy Image URL", Hint("img", i => Clipboard.write(i.src)), ri)
//  8: Omnibar
//  9: Visual Mode
// 10: vim-like marks
// 11: Settings
mapkey(";se", "#11Edit Settings", editSettings, ri)
// 12: Chrome URLs
mapkey("gS", "#12Open Chrome settings", () => tabOpenLink("chrome://settings/"))
// 13: Proxy
// 14: Misc
mapkey("=w", "#14Lookup whois information for domain", whois, ri)
mapkey("=d", "#14Lookup dns information for domain", dns, ri)
mapkey("=D", "#14Lookup all information for domain", dnsVerbose, ri)
mapkey(";pd", "#14Toggle PDF viewer from SurfingKeys", togglePdfViewer, ri)
// 15: Insert Mode

// --- Site-specific mappings ---//
const siteleader = "<Space>"

function mapsitekey(domainRegex, key, desc, f, opts = {}) {
  const o = Object.assign({}, {
    leader: siteleader,
  }, opts)
  mapkey(`${o.leader}${key}`, desc, f, { domain: domainRegex })
}

function mapsitekeys(d, maps, opts = {}) {
  const domain = d.replace(".", "\\.")
  const domainRegex = new RegExp(`^http(s)?://(([a-zA-Z0-9-_]+\\.)*)(${domain})(/.*)?`)
  maps.forEach((map) => {
    const [
      key,
      desc,
      f,
      subOpts = {},
    ] = map
    mapsitekey(domainRegex, key, desc, f, Object.assign({}, opts, subOpts))
  })
}

const fakeSpot = () => window
  .open(`http://fakespot.com/analyze?url=${window.location.href}`, "_blank")
  .focus()

mapsitekeys("amazon.com", [
  ["fs", "Fakespot", fakeSpot],
])

mapsitekeys("yelp.com", [
  ["fs", "Fakespot", fakeSpot],
])

const ytFullscreen = () => document
  .querySelector(".ytp-fullscreen-button.ytp-button")
  .click()

mapsitekeys("youtube.com", [
  ["A", "Open video", Hint("*[id='video-title']")],
  ["C", "Open channel", Hint("*[id='byline']")],
  ["gH", "Goto homepage", () => window.location.assign("https://www.youtube.com/feed/subscriptions?flow=2")],
  ["F", "Toggle fullscreen", ytFullscreen],
  ["<Space>", "Play/pause", Hint(".ytp-play-button")],
], { leader: "" })


const vimeoFullscreen = () => document
  .querySelector(".fullscreen-icon")
  .click()

mapsitekeys("vimeo.com", [
  ["F", "Toggle fullscreen", vimeoFullscreen],
])

const ghStar = toggle => () => {
  const repo = window.location.pathname.slice(1).split("/").slice(0, 2).join("/")
  const container = document.querySelector("div.starring-container")
  const status = container.classList.contains("on")

  let star = "★"
  let statusMsg = "starred"
  let verb = "is"

  if ((status && toggle) || (!status && !toggle)) {
    statusMsg = `un${statusMsg}`
    star = "☆"
  }

  if (toggle) {
    verb = "has been"
    if (status) {
      container.querySelector(".starred>button").click()
    } else {
      container.querySelector(".unstarred>button").click()
    }
  }

  Front.showBanner(`${star} Repository ${repo} ${verb} ${statusMsg}!`)
}

const viewGodoc = () => tabOpenLink(`https://godoc.org/${getURLPath(2, true)}`)

mapsitekeys("github.com", [
  ["s", "Toggle Star", ghStar(true)],
  ["S", "Check Star", ghStar(false)],
  ["y", "Copy Project Path", copyURLPath(2)],
  ["Y", "Copy Project Path (including domain)", copyURLPath(2, true)],
  ["D", "View GoDoc for Project", viewGodoc],
])

const glToggleStar = () => {
  const repo = window.location.pathname.slice(1).split("/").slice(0, 2).join("/")
  const btn = document.querySelector(".btn.star-btn > span")
  btn.click()
  const action = `${btn.textContent.toLowerCase()}red`
  let star = "☆"
  if (action === "starred") {
    star = "★"
  }
  Front.showBanner(`${star} Repository ${repo} ${action}`)
}

mapsitekeys("gitlab.com", [
  ["s", "Toggle Star", glToggleStar],
  ["y", "Copy Project Path", copyURLPath(2)],
  ["Y", "Copy Project Path (including domain)", copyURLPath(2, true)],
  ["D", "View GoDoc for Project", viewGodoc],
])

mapsitekeys("twitter.com", [
  ["f", "Follow user", Hint(".follow-button")],
  ["s", "Like tweet", Hint(".js-actionFavorite")],
  ["R", "Retweet", Hint(".js-actionRetweet")],
  ["c", "Comment/Reply", Hint(".js-actionReply")],
  ["t", "New tweet", Hint(".js-global-new-tweet")],
  ["T", "Tweet to", Hint(".NewTweetButton")],
  ["r", "Load new tweets", Hint(".new-tweets-bar")],
  ["g", "Goto user", Hint(".js-user-profile-link")],
])

mapsitekeys("reddit.com", [
  ["x", "Collapse comment", Hint(".expand")],
  // Not supported by the QuerySelector API
  // ["X", "Collapse next comment", Hint(".expand:visible:not(:contains('[+]')):nth(0)")],
  ["s", "Upvote", Hint(".arrow.up")],
  ["S", "Downvote", Hint(".arrow.down")],
  ["e", "Expand expando", Hint(".expando-button")],
  ["a", "View post (link)", Hint(".title")],
  ["c", "View post (comments)", Hint(".comments")],
])

const hnGoParent = () => {
  const par = document.querySelector(".par>a")
  if (!par) {
    return
  }
  window.location.assign(par.href)
}

mapsitekeys("news.ycombinator.com", [
  ["x", "Collapse comment", Hint(".togg")],
  // Not supported by the QuerySelector API
  // ["X", "Collapse next comment", Hint(".togg:visible:contains('[-]'):nth(0)")],
  ["s", "Upvote", Hint(".votearrow[title='upvote']")],
  ["S", "Downvote", Hint(".votearrow[title='downvote']")],
  ["a", "View post (link)", Hint(".storylink")],
  ["c", "View post (comments)", Hint("td > a[href*='item']:not(.storylink)")],
  ["p", "Go to parent", hnGoParent],
])

const dribbbleAttachment = cb =>
  Hint(".attachments .thumb", a => cb(a.src.replace("/thumbnail/", "/")))

mapsitekeys("dribbble.com", [
  ["s", "Heart Shot", Hint(".toggle-fav, .like-shot")],
  ["a", "View attachment image", dribbbleAttachment(a => tabOpenLink(a))],
  ["A", "Yank attachment image source URL", dribbbleAttachment(a => Clipboard.write(a))],
])

// ---- Search & completion ----//
// Search leader
const sl = "a"

// Register Search Engine Completions
// The `completions` variable is defined in `completions.js` and
// is prepended to this file by gulp-concat.
Object.keys(completions).forEach((k) => {
  const s = completions[k] // Search Engine object
  const la = sl + s.alias // Search leader + alias

  addSearchAliasX(s.alias, s.name, s.search, sl, s.compl, s.callback)
  mapkey(la, `#8Search ${s.name}`, () => Front.openOmnibar({ type: "SearchEngine", extra: s.alias }))
})

// vim: set ft=javascript expandtab:
