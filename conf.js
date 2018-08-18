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
function fakeSpot() {
  const url = `http://fakespot.com/analyze?url=${window.location.href}`
  window.open(url, "_blank").focus()
}

function ytFullscreen() {
  document.querySelector(".ytp-fullscreen-button.ytp-button").click()
}

function vimeoFullscreen() {
  document.querySelector(".fullscreen-icon").click()
}

function ghStar(toggle) {
  return () => {
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
}

function glToggleStar() {
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

function hnGoParent() {
  const par = document.querySelector(".par>a")
  if (!par) {
    return
  }
  window.location.href = par.href
}

function vimEditURL() {
  Front.showEditor(window.location.href, (data) => {
    window.location.href = data
  }, "url")
}

function whois() {
  const url = `http://centralops.net/co/DomainDossier.aspx?dom_whois=true&addr=${window.location.hostname}`
  window.open(url, "_blank").focus()
}

function dns() {
  const url = `http://centralops.net/co/DomainDossier.aspx?dom_dns=true&addr=${window.location.hostname}`
  window.open(url, "_blank").focus()
}

function dnsVerbose() {
  const url = `http://centralops.net/co/DomainDossier.aspx?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true&addr=${window.location.hostname}`
  window.open(url, "_blank").focus()
}

function togglePdfViewer() {
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
}

function getURLPath(count, domain) {
  let path = window.location.pathname.slice(1)
  if (count) {
    path = path.split("/").slice(0, count).join("/")
  }
  if (domain) {
    path = `${window.location.hostname}/${path}`
  }
  return path
}

function copyURLPath(count, domain) {
  return () => Clipboard.write(getURLPath(count, domain))
}

function viewGodoc() {
  const repo = getURLPath(2, true)
  tabOpenLink(`https://godoc.org/${repo}`)
}

function editSettings() {
  tabOpenLink("/pages/options.html")
}

function Hint(selector, action = Hints.dispatchMouseClick) {
  return () => Hints.create(selector, action)
}

// ---- Mapkeys ----//
const ri = { repeatIgnore: true }

mapkey("=w", "Lookup whois information for domain", whois, ri)
mapkey("=d", "Lookup dns information for domain", dns, ri)
mapkey("=D", "Lookup all information for domain", dnsVerbose, ri)
mapkey(";se", "#11Edit Settings", editSettings, ri)
mapkey(";pd", "Toggle PDF viewer from SurfingKeys", togglePdfViewer, ri)
mapkey("gi", "Edit current URL with vim editor", vimEditURL, ri)
mapkey("yp", "Copy URL path of current page", copyURLPath(), ri)
mapkey("gS", "#12Open Chrome settings", () => tabOpenLink("chrome://settings/"))

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

mapsitekeys("amazon.com", [
  ["fs", "Fakespot", fakeSpot],
])

mapsitekeys("yelp.com", [
  ["fs", "Fakespot", fakeSpot],
])

mapsitekeys("youtube.com", [
  ["A", "Open video", Hint("*[id='video-title']")],
  ["C", "Open channel", Hint("*[id='byline']")],
  ["gH", "Goto homepage", () => window.location.assign("https://www.youtube.com/feed/subscriptions?flow=2")],
  ["F", "Toggle fullscreen", ytFullscreen],
  ["<Space>", "Play/pause", Hint(".ytp-play-button")],
], { leader: "" })

mapsitekeys("vimeo.com", [
  ["F", "Toggle fullscreen", vimeoFullscreen],
])

mapsitekeys("github.com", [
  ["s", "Toggle Star", ghStar(true)],
  ["S", "Check Star", ghStar(false)],
  ["y", "Copy Project Path", copyURLPath(2)],
  ["Y", "Copy Project Path (including domain)", copyURLPath(2, true)],
  ["D", "View GoDoc for Project", viewGodoc],
])

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

mapsitekeys("dribbble.com", [
  ["s", "Heart Shot", Hint(".toggle-fav, .like-shot")],
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
