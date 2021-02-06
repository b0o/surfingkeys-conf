const ghReservedNames = require("github-reserved-names")

const util = require("./util")

const actions = {}

// Globally applicable actions
// ===========================

// URL Manipulation/querying
// -------------------------
actions.vimEditURL = () =>
  Front.showEditor(util.getCurrentLocation(), (url) => {
    actions.openLink(url)()
  }, "url")

actions.getURLPath = ({ count = 0, domain = false } = {}) => {
  let path = util.getCurrentLocation("pathname").slice(1)
  if (count) {
    path = path.split("/").slice(0, count).join("/")
  }
  if (domain) {
    path = `${util.getCurrentLocation("hostname")}/${path}`
  }
  return path
}

actions.copyURLPath = ({ count, domain } = {}) => () =>
  Clipboard.write(actions.getURLPath({ count, domain }))

actions.copyOrgLink = () =>
  Clipboard.write(`[[${util.getCurrentLocation("href")}][${document.title}]]`)

actions.copyMarkdownLink = () =>
  Clipboard.write(
    // I mostly use this feature to paste links into my Neuron (github.com/srid/neuron) notes.
    // Due to a bug in Neuron's markdown library (github.com/jgm/commonmark-hs/issues/52),
    // the vertical bar character breaks lists and titles.
    // As a workaround, we backslash-escape any vertical bar characters.
    `[${document.title.replace("|", "\\|")}](${util.getCurrentLocation("href")})`,
  )

actions.duplicateTab = () =>
  actions.openLink(util.getCurrentLocation("href"), { newTab: true, active: false })()

// Site/Page Information
// ---------------------
const ddossierUrl = "http://centralops.net/co/DomainDossier.aspx"

actions.showWhois = ({ hostname = util.getCurrentLocation("hostname") } = {}) =>
  () => actions.openLink(`${ddossierUrl}?dom_whois=true&addr=${hostname}`, { newTab: true })()

actions.showDns = ({ hostname = util.getCurrentLocation("hostname"), verbose = false } = {}) => () => {
  let u = ""
  if (verbose) {
    u = `${ddossierUrl}?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true&addr=${hostname}`
  } else {
    u = `${ddossierUrl}?dom_dns=true&addr=${hostname}`
  }
  actions.openLink(u, { newTab: true })()
}

const googleCacheUrl = "https://webcache.googleusercontent.com/search?q=cache:"

actions.showGoogleCache = ({ href = util.getCurrentLocation("href") } = {}) =>
  () => actions.openLink(`${googleCacheUrl}${href}`, { newTab: true })()

const waybackUrl = "https://web.archive.org/web/*/"

actions.showWayback = ({ href = util.getCurrentLocation("href") } = {}) =>
  () => actions.openLink(`${waybackUrl}${href}`, { newTab: true })()

const outlineUrl = "https://outline.com/"

actions.showOutline = ({ href = util.getCurrentLocation("href") } = {}) =>
  () => actions.openLink(`${outlineUrl}${href}`, { newTab: true })()

// Site/Page Actions
const rssSubscribeUrl = "https://feedrabbit.com/subscriptions/new?url="

actions.rssSubscribe = ({ href = util.getCurrentLocation("href") } = {}) =>
  () => actions.openLink(`${rssSubscribeUrl}${encodeURIComponent(href)}`, { newTab: true })()

actions.showSpeedReader = () => {
  const script = document.createElement("script")
  script.innerHTML = `(() => {
    const sq = window.sq || {}
    window.sq = sq
    if (sq.script) {
      sq.again()
    } else if (sq.context !== "inner") {
      sq.bookmarkletVersion = "0.3.0"
      sq.iframeQueryParams = { host: "//squirt.io" }
      sq.script = document.createElement("script")
      sq.script.src = \`\${sq.iframeQueryParams.host}/bookmarklet/frame.outer.js\`
      document.body.appendChild(sq.script)
    }
  })()`
  document.body.appendChild(script)
}

actions.scrollToHash = (hash = null) => {
  const h = (hash || document.location.hash).replace("#", "")
  const e = document.getElementById(h) || document.querySelector(`[name="${h}"]`)
  if (!e) {
    return
  }
  e.scrollIntoView({ behavior: "smooth" })
}

// Surfingkeys-specific actions
// ----------------------------
actions.createHints = (selector, action) => () => {
  if (typeof action === "undefined") {
    // Use manual reassignment rather than a default arg so that we can lint/bundle without access
    // to the Hints object
    action = Hints.dispatchMouseClick // eslint-disable-line no-param-reassign
  }
  Hints.create(selector, action)
}

actions.openAnchor = ({ newTab = false, active = true, prop = "href" } = {}) => (a) => actions.openLink(a[prop], { newTab, active })()

actions.openLink = (url, { newTab = false, active = true } = {}) => () => {
  if (newTab) {
    RUNTIME("openLink", { tab: { tabbed: true, active }, url })
    return
  }
  window.location.assign(url)
}

actions.editSettings = () => tabOpenLink(chrome.extension.getURL("/pages/options.html"))

actions.togglePdfViewer = () => chrome.storage.local.get("noPdfViewer", (resp) => {
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

actions.previewLink = actions.createHints("a[href]", (a) =>
  Front.showEditor(a.href, (url) => actions.openLink(url)(), "url"))

// FakeSpot
// --------
actions.fakeSpot = (url = util.getCurrentLocation("href")) =>
  actions.openLink(`https://fakespot.com/analyze?ra=true&url=${url}`, { newTab: true, active: false })()

// Site-specific actions
// =====================

// Amazon
// -----
actions.az = {}
actions.az.viewProduct = () => {
  const reHost = /^([-\w]+[.])*amazon.\w+$/
  const rePath = /^(?:.*\/)*(?:dp|gp\/product)(?:\/(\w{10})).*/
  const elements = {}
  document.querySelectorAll("a[href]").forEach((a) => {
    const u = new URL(a.href)
    if (u.hash.length === 0 && reHost.test(u.hostname)) {
      const rePathRes = rePath.exec(u.pathname)
      if (rePathRes === null || rePathRes.length !== 2) {
        return
      }
      if (!util.isElementInViewport(a)) {
        return
      }

      const asin = rePathRes[1]

      if (elements[asin] !== undefined) {
        if (!(elements[asin].text.trim().length === 0 && a.text.trim().length > 0)) {
          return
        }
      }

      elements[asin] = a
    }
  })
  Hints.create(Object.values(elements), Hints.dispatchMouseClick)
}

// Godoc
// -----
actions.viewGodoc = () => actions.openLink(`https://godoc.org/${actions.getURLPath({ count: 2, domain: true })}`, { newTab: true })()

// Google
actions.go = {}
actions.go.parseLocation = () => {
  const u = new URL(util.getCurrentLocation())
  const q = u.searchParams.get("q")
  const p = u.pathname.split("/")

  const res = {
    type:  "unknown",
    url:   u,
    query: q,
  }

  if (u.hostname === "www.google.com") { // TODO: handle other ccTLDs
    if (p.length <= 1) {
      res.type = "home"
    } else if (p[1] === "search") {
      switch (u.searchParams.get("tbm")) {
      case "vid":
        res.type = "videos"
        break
      case "isch":
        res.type = "images"
        break
      case "nws":
        res.type = "news"
        break
      default:
        res.type = "web"
      }
    } else if (p[1] === "maps") {
      res.type = "maps"
      if (p[2] === "search" && p[3] !== undefined) {
        res.query = p[3] // eslint-disable-line prefer-destructuring
      } else if (p[2] !== undefined) {
        res.query = p[2] // eslint-disable-line prefer-destructuring
      }
    }
  }

  return res
}

actions.go.ddg = () => {
  const g = actions.go.parseLocation()

  const ddg = new URL("https://duckduckgo.com")
  if (g.query) {
    ddg.searchParams.set("q", g.query)
  }

  switch (g.type) {
  case "videos":
    ddg.searchParams.set("ia", "videos")
    ddg.searchParams.set("iax", "videos")
    break
  case "images":
    ddg.searchParams.set("ia", "images")
    ddg.searchParams.set("iax", "images")
    break
  case "news":
    ddg.searchParams.set("ia", "news")
    ddg.searchParams.set("iar", "news")
    break
  case "maps":
    ddg.searchParams.set("iaxm", "maps")
    break
  case "search":
  case "home":
  case "unknown":
  default:
    ddg.searchParams.set("ia", "web")
    break
  }

  actions.openLink(ddg.href)()
}

// DuckDuckGo
actions.dg = {}
actions.dg.goog = () => {
  let u
  try {
    u = new URL(util.getCurrentLocation())
  } catch (e) {
    return
  }
  const q = u.searchParams.get("q")
  if (!q) {
    return
  }

  const goog = new URL("https://google.com/search")
  goog.searchParams.set("q", q)

  const iax = u.searchParams.get("iax")
  const iaxm = u.searchParams.get("iaxm")
  const iar = u.searchParams.get("iar")

  if (iax === "images") {
    goog.searchParams.set("tbm", "isch")
  } else if (iax === "videos") {
    goog.searchParams.set("tbm", "vid")
  } else if (iar === "news") {
    goog.searchParams.set("tbm", "nws")
  } else if (iaxm === "maps") {
    goog.pathname = "/maps"
  }

  actions.openLink(goog.href)()
}

// GitHub
// ------
// TODO: This is a mess
actions.gh = {}
actions.gh.star = ({ toggle = false } = {}) => async () => {
  const hasDisplayNoneParent = (e) =>
    window.getComputedStyle(e).display === "none"
    || (e.parentElement ? hasDisplayNoneParent(e.parentElement) : false)

  const starContainers = Array.from(document.querySelectorAll("div.starring-container"))
    .filter((e) => !hasDisplayNoneParent(e))

  if (starContainers.length === 0) return

  let container
  try {
    container = starContainers.length > 1
      ? await util.createHintsAsync(starContainers, (c) => c)
      : starContainers[0]
  } catch (e) {
    return
  }

  const repoUrl = container.parentElement.parentElement.matches("ul.pagehead-actions")
    ? util.getCurrentLocation("pathname")
    : new URL(container.parentElement.querySelector("form").action).pathname

  const status = container.classList.contains("on")
  const repo = repoUrl.slice(1).split("/").slice(0, 2).join("/")

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
      container.querySelector(".starred>button, button.starred").click()
    } else {
      container.querySelector(".unstarred>button, button.unstarred").click()
    }
  }

  Front.showBanner(`${star} Repository ${repo} ${verb} ${statusMsg}!`)
}

actions.gh.parseRepo = (url = util.getCurrentLocation(), rootOnly = false) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && typeof repo === "string"
    && repo.length > 0
    && (isRoot || rootOnly === false)
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      type:     "repo",
      user,
      repo,
      owner:    user,
      name:     repo,
      href:     url,
      url:      u,
      repoBase: `/${user}/${repo}`,
      repoRoot: isRoot,
      repoPath: rest,
    }
    : null
}

actions.gh.parseUser = (url = util.getCurrentLocation(), rootOnly = false) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && (rootOnly === false || rest.length === 0)
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      type:     "user",
      name:     user,
      user,
      href:     url,
      url:      u,
      userRoot: isRoot,
      userPath: rest,
    }
    : null
}

actions.gh.parseFile = (url = util.getCurrentLocation()) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, pathType, commitHash, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && typeof repo === "string"
    && repo.length > 0
    && typeof pathType === "string"
    && (pathType === "blob" || pathType === "tree")
    && typeof commitHash === "string"
    && commitHash.length > 0
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      type:     "file",
      user,
      repo,
      pathType,
      commitHash,
      href:     url,
      url:      u,
      filePath: rest,
      repoBase: `/${user}/${repo}`,
    }
    : null
}

actions.gh.parseCommit = (url = util.getCurrentLocation()) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, commit, commitHash] = u.pathname.split("/").filter((s) => s !== "")
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && typeof repo === "string"
    && repo.length > 0
    && typeof commit === "string"
    && commit === "commit"
    && typeof commitHash === "string"
    && commitHash.length > 0
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      type: "commit",
      user,
      repo,
      commitHash,
      href: url,
      url:  u,
    }
    : null
}

actions.gh.parseIssue = (url = util.getCurrentLocation()) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, maybeIssues, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && typeof repo === "string"
    && repo.length > 0
    && maybeIssues === "issues"
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      href: url,
      url:  u,
      ...(isRoot ? {
        type:      "issues",
        issuePath: rest,
      } : {
        type:      "issue",
        number:    rest[0],
        issuePath: rest,
      }),
    }
    : null
}

actions.gh.parsePull = (url = util.getCurrentLocation()) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, maybePulls, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && typeof repo === "string"
    && repo.length > 0
    && /^pulls?$/.test(maybePulls)
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      href: url,
      url:  u,
      ...(isRoot ? {
        type:     "pulls",
        pullPath: rest,
      } : {
        type:     "pull",
        number:   rest[0],
        pullPath: rest,
      }),
    }
    : null
}

actions.gh.isUser = (url = util.getCurrentLocation(), rootOnly = true) =>
  actions.gh.parseUser(url, rootOnly) !== null

actions.gh.isRepo = (url = util.getCurrentLocation(), rootOnly = true) =>
  actions.gh.parseRepo(url, rootOnly) !== null

actions.gh.isFile = (url = util.getCurrentLocation()) => actions.gh.parseFile(url) !== null
actions.gh.isCommit = (url = util.getCurrentLocation()) => actions.gh.parseCommit(url) !== null
actions.gh.isIssue = (url = util.getCurrentLocation()) => actions.gh.parseIssue(url) !== null
actions.gh.isPull = (url = util.getCurrentLocation()) => actions.gh.parsePull(url) !== null

actions.gh.openRepo = () => util.createHintsFiltered((a) => actions.gh.isRepo(a.href))
actions.gh.openUser = () => util.createHintsFiltered((a) => actions.gh.isUser(a.href))
actions.gh.openFile = () => util.createHintsFiltered((a) => actions.gh.isFile(a.href))
actions.gh.openCommit = () => util.createHintsFiltered((a) => actions.gh.isCommit(a.href))
actions.gh.openIssue = () => util.createHintsFiltered((a) => actions.gh.isIssue(a.href))
actions.gh.openPull = () => util.createHintsFiltered((a) => actions.gh.isPull(a.href))

actions.gh.openRepoPage = (repoPath) => () => {
  const repo = actions.gh.parseRepo()
  if (repo === null) return
  actions.openLink(`${repo.repoBase}${repoPath}`)()
}

actions.gh.openRepoOwner = () => {
  const repo = actions.gh.parseRepo()
  if (repo === null) return
  actions.openLink(`/${repo.owner}`)()
}

actions.gh.openProfile = () =>
  actions.openLink(`/${document.querySelector("meta[name='user-login']").content}`)()

actions.gh.toggleLangStats = () =>
  document.querySelector(".repository-lang-stats-graph").click()

actions.gh.goParent = () => {
  const segments = util.getCurrentLocation("pathname")
    .split("/").filter((s) => s !== "")
  const newPath = (() => {
    const [user, repo, pathType] = segments
    switch (segments.length) {
    case 0:
      return false
    case 4:
      switch (pathType) {
      case "blob":
      case "tree":
        return [user, repo]
      case "pull":
        return [user, repo, "pulls"]
      default:
        break
      }
      break
    case 5:
      if (pathType === "blob") {
        return [user, repo]
      }
      break
    default:
      break
    }
    return segments.slice(0, segments.length - 1)
  })()
  if (newPath !== false) {
    const u = `${util.getCurrentLocation("origin")}/${newPath.join("/")}`
    actions.openLink(u)()
  }
}

actions.gh.viewSourceGraph = () => {
  const url = new URL("https://sourcegraph.com/github.com")
  let page = null
  // The following conditional expressions are indeed intended to be
  // assignments, this is not a bug.
  if ((page = actions.gh.parseFile(window.location.href)) !== null) {
    const filePath = page.filePath.join("/")
    url.pathname += `/${page.user}/${page.repo}@${page.commitHash}/-/${page.pathType}/${filePath}`
    if (window.location.hash !== "") {
      url.hash = window.location.hash
    } else if (!util.isElementInViewport(document.querySelector("#L1"))) {
      for (const e of document.querySelectorAll(".js-line-number")) {
        if (util.isElementInViewport(e)) {
          url.hash = e.id
          break
        }
      }
    }
  } else if ((page = actions.gh.parseCommit(window.location.href)) !== null) {
    url.pathname += `/${page.user}/${page.repo}@${page.commitHash}`
  } else if ((page = actions.gh.parseRepo(window.location.href)) !== null) {
    url.pathname += `/${page.user}/${page.repo}`
  } else {
    url.pathname = ""
  }

  actions.openLink(url.href, { newTab: true })()
}

actions.gh.viewRaw = () => {
  const file = actions.gh.parseFile()
  if (file === null) return
  actions.openLink(`https://raw.githack.com/${file.user}/${file.repo}/${file.filePath.join("/")}`, { newTab: true })()
}

actions.gh.openRepoFromClipboard = async ({ newTab = true } = {}) =>
  actions.openLink(`https://github.com/${await navigator.clipboard.readText()}`, { newTab })()

actions.gh.openFileFromClipboard = async ({ newTab = true } = {}) => {
  const clip = await navigator.clipboard.readText()
  if (typeof clip !== "string" || clip.length === 0) {
    return
  }

  const loc = util.getCurrentLocation()
  const dest = {
    user:       null,
    repo:       null,
    commitHash: "master",
  }

  const file = actions.gh.parseFile(loc)
  if (file !== null) {
    dest.user = file.user
    dest.repo = file.repo
    dest.commitHash = file.commitHash
  } else {
    const commit = actions.gh.parseCommit(loc)
    if (commit !== null) {
      dest.user = commit.user
      dest.repo = commit.repo
      dest.commitHash = commit.commitHash
    } else {
      const repository = actions.gh.parseRepo(loc)
      if (repository !== null) {
        return
      }
      dest.user = repository.user
      dest.repo = repository.repo
    }
  }

  actions.openLink(
    `https://github.com/${dest.user}/${dest.repo}/tree/${dest.commitHash}/${clip}`,
    { newTab },
  )()
}

// GitLab
// ------
actions.gl = {}
actions.gl.star = () => {
  const repo = util.getCurrentLocation("pathname").slice(1).split("/").slice(0, 2).join("/")
  const btn = document.querySelector(".btn.star-btn > span")
  btn.click()
  const action = `${btn.textContent.toLowerCase()}red`
  let star = "☆"
  if (action === "starred") {
    star = "★"
  }
  Front.showBanner(`${star} Repository ${repo} ${action}`)
}

// Twitter
// ------
actions.tw = {}
actions.tw.openUser = () =>
  actions.createHints([].concat(
    [...document.querySelectorAll("a[role='link'] img[src^='https://pbs.twimg.com/profile_images']")]
      .map((e) => e.closest("a")),
    [...document.querySelectorAll("a[role='link']")]
      .filter((e) => e.text.match(/^@/)),
  ))()

// Reddit
// ------
actions.re = {}
actions.re.collapseNextComment = () => {
  const vis = Array.from(document.querySelectorAll(".noncollapsed.comment"))
    .filter((e) => util.isElementInViewport(e))
  if (vis.length > 0) {
    vis[0].querySelector(".expand").click()
  }
}

// Unfortunately, this does not work - Reddit will only load the first
// Expando
actions.re.toggleVisibleExpandos = (dir = 0) => () => {
  let sel = ".expando-button"
  if (dir === -1) {
    sel += ".expanded"
  } else if (dir === 1) {
    sel += ".collapsed"
  }
  Array.from(document.querySelectorAll(sel))
    .filter((e) => util.isElementInViewport(e))
    .forEach((e) => e.click())
}

// HackerNews
// ----------
actions.hn = {}
actions.hn.goParent = () => {
  const par = document.querySelector(".par>a")
  if (!par) {
    return
  }
  actions.openLink(par.href)()
}

actions.hn.collapseNextComment = () => {
  const vis = Array.from(document.querySelectorAll("a.togg"))
    .filter((e) => e.innerText === "[–]" && util.isElementInViewport(e))
  if (vis.length > 0) {
    vis[0].click()
  }
}

actions.hn.goPage = (dist = 1) => {
  let u
  try {
    u = new URL(util.getCurrentLocation())
  } catch (e) {
    return
  }
  let page = u.searchParams.get("p")
  if (page === null || page === "") {
    page = "1"
  }
  const cur = parseInt(page, 10)
  if (Number.isNaN(cur)) {
    return
  }
  const dest = cur + dist
  if (dest < 1) {
    return
  }
  u.searchParams.set("p", dest)
  actions.openLink(u.href)()
}

actions.hn.openLinkAndComments = (e) => {
  const linkUrl = e.querySelector("a.storylink").href
  const commentsUrl = e.nextElementSibling.querySelector("td > a[href*='item']:not(.storylink)").href
  actions.openLink(commentsUrl, { newTab: true })()
  actions.openLink(linkUrl, { newTab: true })()
}

// ProductHunt
// -----------
actions.ph = {}
actions.ph.openExternal = () => {
  Hints.create("ul[class^='postsList_'] > li > div[class^='item_']", (p) => actions.openLink(
    p.querySelector("div[class^='meta_'] > div[class^='actions_'] > div[class^='minorActions_'] > a:nth-child(1)").href,
    { newTab: true },
  )())
}

// Dribbble
// --------
actions.dr = {}
actions.dr.attachment = (cb = (a) => actions.openLink(a, { newTab: true })()) => actions.createHints(".attachments .thumb", (a) => cb(a.src.replace("/thumbnail/", "/")))

// Wikipedia
// ---------
actions.wp = {}
actions.wp.toggleSimple = () => {
  const u = new URL(util.getCurrentLocation("href"))
  u.hostname = u.hostname.split(".")
    .map((s, i) => {
      if (i === 0) {
        return s === "simple" ? "" : "simple"
      }
      return s
    }).filter((s) => s !== "").join(".")
  actions.openLink(u.href)()
}

actions.wp.viewWikiRank = () => {
  const h = document.location.hostname.split(".")
  const lang = h.length > 2 && h[0] !== "www" ? h[0] : "en"
  const p = document.location.pathname.split("/")
  if (p.length < 3 || p[1] !== "wiki") {
    return
  }
  const article = p.slice(2).join("/")
  actions.openLink(`https://wikirank.net/${lang}/${article}`, { newTab: true })()
}

// Nest Thermostat Controller
// --------------------------
actions.nt = {}
actions.nt.adjustTemp = (dir) => () =>
  document.querySelector(
    `button[data-test='thermozilla-controller-controls-${dir > 0 ? "in" : "de"}crement-button']`,
  ).click()

actions.nt.setMode = (mode) => async () => {
  const selectMode = async (popover) => {
    const query = () => !popover.isConnected
    const q = query()
    if (q) return q
    popover.querySelector(`button[data-test='thermozilla-mode-switcher-${mode}-button']`).click()
    return util.until(query)
  }

  const openPopover = async () => {
    const query = () => document.querySelector("div[data-test='thermozilla-mode-popover']")
    const q = query()
    if (q) return q
    document.querySelector("button[data-test='thermozilla-mode-button']").click()
    return util.until(query)
  }

  const popover = await openPopover()
  return selectMode(popover)
}

actions.nt.setFan = (desiredState) => async () => {
  const startStopFan = async (startStop, popover) => {
    const query = () => !popover.isConnected
    const q = query()
    if (q) return q
    popover.querySelector(`div[data-test='thermozilla-fan-timer-${startStop}-button']`).click()
    return util.until(query)
  }

  const selectFanTime = async (popover, listbox) => {
    const query = () => !listbox.isConnected
    const q = query()
    if (q) return q
    Hints.dispatchMouseClick(listbox.querySelector("div[role='option']:last-child"))
    return util.until(query)
  }

  const openFanListbox = async (popover) => {
    const query = () => popover.querySelector("div[role='listbox']")
    const q = query()
    if (q) return q
    Hints.dispatchMouseClick(popover.querySelector("div[role='combobox']"))
    return util.until(query)
  }

  const openPopover = async () => {
    const query = () => document.querySelector("div[data-test='thermozilla-fan-timer-popover']")
    const q = query()
    if (q) return q
    document.querySelector("button[data-test='thermozilla-fan-button']").click()
    return util.until(query)
  }

  const fanRunning = () => document.querySelector("div[data-test='thermozilla-aag-fan-listcell-title']")

  const startFan = async () => {
    const popover = await openPopover()
    const listbox = await openFanListbox(popover)
    await selectFanTime(popover, listbox)
    return startStopFan("start", popover)
  }

  const stopFan = async () => {
    const popover = await openPopover()
    await startStopFan("stop", popover)
    await util.until(() => !fanRunning())
  }

  if (fanRunning()) {
    await stopFan()
  }

  if (desiredState === 1) {
    await startFan()
  }
}

module.exports = actions
