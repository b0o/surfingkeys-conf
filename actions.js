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
  Clipboard.write(`[${document.title}](${util.getCurrentLocation("href")})`)

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

// Surfingkeys-specific actions
// ----------------------------
actions.createHint = (selector, action) => () => {
  if (typeof action === "undefined") {
    // Use manual reassignment rather than default arg so that we can pre-compile without access
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

actions.previewLink = actions.createHint("a[href]", (a) =>
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

// GitHub
// ------
actions.gh = {}
actions.gh.star = ({ toggle = false } = {}) => async () => {
  const starContainers = [...document.querySelectorAll("div.starring-container")]
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
    : new URL(container.parentElement.querySelector("a").href).pathname

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
      container.querySelector(".starred>button").click()
    } else {
      container.querySelector(".unstarred>button").click()
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
      href:     url,
      url:      u,
      userRoot: isRoot,
      userPath: rest,
    }
    : null
}

actions.gh.parseFile = (url = util.getCurrentLocation()) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, maybeBlob, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const cond = (
    u.origin === util.getCurrentLocation("origin")
    && typeof user === "string"
    && user.length > 0
    && typeof repo === "string"
    && repo.length > 0
    && typeof maybeBlob === "string"
    && (maybeBlob === "blob" || maybeBlob === "tree")
    && rest.length !== 0
    && /^([a-zA-Z0-9]+-?)+$/.test(user)
    && !ghReservedNames.check(user)
  )
  return cond
    ? {
      type:     "file",
      href:     url,
      url:      u,
      filePath: [maybeBlob].concat(rest),
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
actions.gh.isIssue = (url = util.getCurrentLocation()) => actions.gh.parseIssue(url) !== null
actions.gh.isPull = (url = util.getCurrentLocation()) => actions.gh.parsePull(url) !== null

actions.gh.openRepo = () => util.createHintsFiltered((a) => actions.gh.isRepo(a.href))
actions.gh.openUser = () => util.createHintsFiltered((a) => actions.gh.isUser(a.href))
actions.gh.openFile = () => util.createHintsFiltered((a) => actions.gh.isFile(a.href))
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
  actions.openLink(`${document.querySelector("a.user-profile-link").href}`)()

actions.gh.toggleLangStats = () =>
  document.querySelector(".repository-lang-stats-graph").click()

actions.gh.goParent = () => {
  const segments = util.getCurrentLocation("pathname")
    .split("/").filter((s) => s !== "")
  const newPath = (() => {
    const [user, repo, maybeBlob] = segments
    switch (segments.length) {
    case 0:
      return false
    case 4:
      switch (maybeBlob) {
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
      if (maybeBlob === "blob") {
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
    .filter((e) => e.innerText === "[-]" && util.isElementInViewport(e))
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
    { newTab: true }
  )())
}

// Dribbble
// --------
actions.dr = {}
actions.dr.attachment = (cb = (a) => actions.openLink(a, { newTab: true })()) => actions.createHint(".attachments .thumb", (a) => cb(a.src.replace("/thumbnail/", "/")))

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

module.exports = actions
