import ghReservedNames from "github-reserved-names"

import util from "./util.js"
import api from "./api.js"

const {
  tabOpenLink,
  Front,
  Hints,
  Normal,
  RUNTIME,
} = api

const actions = {}

// Globally applicable actions
// ===========================

actions.moveTabNextToTab = (targetId, nextTo, leftOf = false) =>
  browser.tabs.move(targetId, { windowId: nextTo.windowId, index: nextTo.index - (leftOf ? 1 : 0) })

// TODO
// actions.cutTab = async () =>
//   browser.storage.local.set({
//     cutTabEvent: {
//       tabId:     (await browser.tabs.query({ currentWindow: true, active: true }))[0].id,
//       timestamp: new Date(),
//     },
//   })

// actions.pasteTab = async (leftOf = false) => {
//   const { cutTabEvent = null } = await browser.storage.local.get("cutTabEvent")
//   if (!cutTabEvent || (new Date() - cutTabEvent.timestamp) > 60000) return
//   const curTab = (await browser.tabs.query({ currentWindow: true, active: true }))[0]
//   await actions.moveTabNextToTab(cutTabEvent.tabId, curTab, leftOf)
// }

actions.dispatchEvents = (type, node, ...eventTypes) =>
  eventTypes.forEach((t) => {
    const e = document.createEvent(type)
    e.initEvent(t, true, true)
    node.dispatchEvent(e)
  })

actions.dispatchMouseEvents = actions.dispatchEvents.bind(undefined, ["MouseEvents"])

actions.scrollToHash = (hash = null) => {
  const h = (hash || document.location.hash).replace("#", "")
  const e = document.getElementById(h) || document.querySelector(`[name="${h}"]`)
  if (!e) {
    return
  }
  e.scrollIntoView({ behavior: "smooth" })
}

// URL Manipulation/querying
// -------------------------
actions.vimEditURL = () =>
  Front.showEditor(window.location.href, (url) => {
    actions.openLink(url)
  }, "url")

actions.getOrgLink = () =>
  `[[${window.location.href}][${document.title}]]`

actions.getMarkdownLink = ({ title = document.title, href = window.location.href } = {}) =>
  `[${title}](${href})`

// Site/Page Information
// ---------------------

const ddossierUrl = "http://centralops.net/co/DomainDossier.aspx"

actions.getWhoisUrl = ({ hostname = window.location.hostname } = {}) =>
  `${ddossierUrl}?dom_whois=true&addr=${hostname}`

actions.getDnsInfoUrl = ({ hostname = window.location.hostname, all = false } = {}) =>
  `${ddossierUrl}?dom_dns=true&addr=${hostname}${
    all ? "?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true" : ""
  }`

actions.getGoogleCacheUrl = ({ href = window.location.href } = {}) =>
  `https://webcache.googleusercontent.com/search?q=cache:${href}`

actions.getWaybackUrl = ({ href = window.location.href } = {}) =>
  `https://web.archive.org/web/*/${href}`

actions.getOutlineUrl = ({ href = window.location.href } = {}) =>
  `https://outline.com/${href}`

actions.getAlexaUrl = ({ hostname = window.location.hostname } = {}) =>
  `https://www.alexa.com/siteinfo/${hostname}`

actions.getBuiltWithUrl = ({ href = window.location.href } = {}) =>
  `https://www.builtwith.com/?${href}`

actions.getWappalyzerUrl = ({ hostname = window.location.hostname } = {}) =>
  `https://www.wappalyzer.com/lookup/${hostname}`

actions.getDiscussionsUrl = ({ href = window.location.href } = {}) =>
  `https://discussions.xojoc.pw/?${(new URLSearchParams({ url: href }))}`

// Custom Omnibar interfaces
// ------------------------
actions.omnibar = {}

// AWS Services
actions.omnibar.aws = () => {
  // const services = [
  //   {
  //     title: "EC2",
  //     url:   "https://cn-northwest-1.console.amazonaws.cn/ec2/v2/home?region=cn-northwest-1",
  //   },
  //   {
  //     title: "Elastic Beanstalk",
  //     url:   "https://cn-northwest-1.console.amazonaws.cn/elasticbeanstalk/home?region=cn-northwest-1",
  //   },
  //   {
  //     title: "Batch",
  //     url:   "https://cn-northwest-1.console.amazonaws.cn/batch/home?region=cn-northwest-1",
  //   },
  // ]
  // Front.openOmnibar({ type: "UserURLs", extra: services })
  Front.openOmnibar({
    type:  "Custom",
    extra: {
      prompt:  "AWS",
      onInput: console.log,
    },
  })
}

// Surfingkeys-specific actions
// ----------------------------
actions.openAnchor = ({ newTab = false, active = true, prop = "href" } = {}) =>
  (a) => actions.openLink(a[prop], { newTab, active })

actions.openLink = (url, { newTab = false, active = true } = {}) => {
  if (newTab) {
    RUNTIME("openLink", { tab: { tabbed: true, active }, url: url instanceof URL ? url.href : url })
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

actions.previewLink = () => util.createHints("a[href]", (a) =>
  Front.showEditor(a.href, (url) => actions.openLink(url), "url"))

actions.scrollElement = (el, dir) => {
  actions.dispatchMouseEvents(el, "mousedown")
  Normal.scroll(dir)
}

// FakeSpot
// --------
actions.fakeSpot = (url = window.location.href) =>
  actions.openLink(`https://fakespot.com/analyze?ra=true&url=${url}`, { newTab: true, active: false })

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
actions.viewGodoc = () => actions.openLink(`https://godoc.org/${util.getURLPath({ count: 2, domain: true })}`, { newTab: true })

// Google
actions.go = {}
actions.go.parseLocation = () => {
  const u = new URL(window.location.href)
  const q = u.searchParams.get("q")
  const p = u.pathname.split("/")

  const res = {
    type:  "unknown",
    url:   u,
    query: q,
  }

  if (u.hostname === "www.google.com") {
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

  actions.openLink(ddg.href)
}

// DuckDuckGo
actions.dg = {}
actions.dg.goog = () => {
  let u
  try {
    u = new URL(window.location.href)
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

  actions.openLink(goog.href)
}

actions.dg.siteSearch = (site) => {
  let u
  try {
    u = new URL(window.location.href)
  } catch (e) {
    return
  }

  const siteParam = `site:${site}`

  const q = u.searchParams.get("q")
  if (!q) {
    return
  }

  const i = q.indexOf(siteParam)
  if (i !== -1) {
    u.searchParams.set("q", q.replace(siteParam, ""))
  } else {
    u.searchParams.set("q", `${q} ${siteParam}`)
  }

  actions.openLink(u.href)
}

// GitHub
// ------
actions.gh = {}
actions.gh.star = ({ toggle = false } = {}) => async () => {
  const hasDisplayNoneParent = (e) =>
    window.getComputedStyle(e).display === "none"
    || (e.parentElement ? hasDisplayNoneParent(e.parentElement) : false)

  const starContainers = Array.from(document.querySelectorAll("div.starring-container"))
    .filter((e) => !hasDisplayNoneParent(e))

  let container
  switch (starContainers.length) {
  case 0:
    return
  case 1:
    [container] = starContainers
    break
  default:
    try {
      container = await util.createHints(starContainers, { action: null })
    } catch (_) { return }
  }

  const repoUrl = container.parentElement.parentElement?.matches("ul.pagehead-actions")
    ? window.location.pathname
    : new URL(container.parentElement.querySelector("form").action).pathname

  const status = container.classList.contains("on")
  const repo = repoUrl.slice(1).split("/").slice(0, 2).join("/")

  let star = "★"
  let statusMsg = "starred"
  let copula = "is"

  if ((status && toggle) || (!status && !toggle)) {
    statusMsg = `un${statusMsg}`
    star = "☆"
  }

  if (toggle) {
    copula = "has been"
    container.querySelector(status ? ".starred button, button.starred" : ".unstarred button, button.unstarred").click()
  }

  Front.showBanner(`${star} Repository ${repo} ${copula} ${statusMsg}!`)
}

actions.gh.parseRepo = (url = window.location.href, rootOnly = false) => {
  let u
  try {
    u = url instanceof URL ? url : new URL(url)
  } catch (e) {
    u = new URL(`https://github.com/${url}`)
  }
  const [user, repo, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    ["github.com", "gist.github.com", "raw.githubusercontent.com"].includes(u.hostname)
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
      repoBase: `${user}/${repo}`,
      repoRoot: isRoot,
      repoPath: rest,
    }
    : null
}

actions.gh.parseUser = (url = window.location.href, rootOnly = false) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === window.location.origin
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

actions.gh.parseFile = (url = window.location.href) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, pathType, commitHash, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const cond = (
    u.origin === window.location.origin
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
  if (!cond) return null
  const f = {
    type:        "file",
    user,
    repo,
    pathType,
    commitHash,
    isDirectory: pathType === "tree",
    href:        url,
    url:         u,
    filePath:    rest,
    repoBase:    `/${user}/${repo}`,
  }
  f.rawUrl = f.isDirectory
    ? null
    : `https://raw.githubusercontent.com/${f.user}/${f.repo}/${f.commitHash}/${f.filePath.join("/")}`
  return f
}

actions.gh.parseCommit = (url = window.location.href) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, commit, commitHash] = u.pathname.split("/").filter((s) => s !== "")
  const cond = (
    u.origin === window.location.origin
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

actions.gh.parseIssue = (url = window.location.href) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, maybeIssues, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === window.location.origin
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

actions.gh.parsePull = (url = window.location.href) => {
  const u = url instanceof URL ? url : new URL(url)
  const [user, repo, maybePulls, ...rest] = u.pathname.split("/").filter((s) => s !== "")
  const isRoot = rest.length === 0
  const cond = (
    u.origin === window.location.origin
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

actions.gh.isUser = (url = window.location.href, rootOnly = true) =>
  actions.gh.parseUser(url, rootOnly) !== null

actions.gh.isRepo = (url = window.location.href, rootOnly = true) =>
  actions.gh.parseRepo(url, rootOnly) !== null

actions.gh.isFile = (url = window.location.href) => actions.gh.parseFile(url) !== null
actions.gh.isCommit = (url = window.location.href) => actions.gh.parseCommit(url) !== null
actions.gh.isIssue = (url = window.location.href) => actions.gh.parseIssue(url) !== null
actions.gh.isPull = (url = window.location.href) => actions.gh.parsePull(url) !== null

actions.gh.openRepo = () => util.createHintsFiltered((a) => actions.gh.isRepo(a.href))
actions.gh.openUser = () => util.createHintsFiltered((a) => actions.gh.isUser(a.href))
actions.gh.openFile = () => util.createHintsFiltered((a) => actions.gh.isFile(a.href))
actions.gh.openCommit = () => util.createHintsFiltered((a) => actions.gh.isCommit(a.href))
actions.gh.openIssue = () => util.createHintsFiltered((a) => actions.gh.isIssue(a.href))
actions.gh.openPull = () => util.createHintsFiltered((a) => actions.gh.isPull(a.href))

actions.gh.openPage = (path) => actions.openLink(`https://github.com/${path}`)

actions.gh.openRepoPage = (repoPath) => {
  const repo = actions.gh.parseRepo()
  if (repo === null) return
  actions.gh.openPage(`${repo.repoBase}${repoPath}`)
}

actions.gh.openRepoOwner = () => {
  const repo = actions.gh.parseRepo()
  if (repo === null) return
  actions.gh.openPage(`${repo.owner}`)
}

actions.gh.openGithubPagesRepo = () => {
  const user = window.location.hostname.split(".")[0]
  const repo = window.location.pathname.split("/")[1] ?? ""
  actions.gh.openPage(`${user}/${repo}`)
}

actions.gh.openSourceFile = () => {
  const p = window.location.pathname.split("/")
  actions.gh.openPage(`${[...p.slice(1, 3), "tree", ...p.slice(3)].join("/")}`)
}

actions.gh.openProfile = () =>
  actions.gh.openPage(`${document.querySelector("meta[name='user-login']").content}`)

actions.gh.toggleLangStats = () =>
  document.querySelector(".repository-lang-stats-graph").click()

actions.gh.goParent = () => {
  const segments = window.location.pathname
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
    const u = `${window.location.origin}/${newPath.join("/")}`
    actions.openLink(u)
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

  actions.openLink(url.href, { newTab: true })
}

actions.gh.selectFile = async ({ files = true, directories = true } = {}) => {
  if (!(files || directories)) throw new Error("At least one of 'files' or 'directories' must be true")

  const test = (f) => f && !((!directories && f.isDirectory) || (!files && !f.isDirectory))

  let file = actions.gh.parseFile()
  if (test(file)) return file

  const repo = actions.gh.parseRepo()
  if (repo === null) throw new Error("Not a repository")

  const elem = util.createHintsFiltered((a) => {
    const f = actions.gh.parseFile(a.href)
    return f && f.isDirectory === false
  }, null)

  file = actions.gh.parseFile(elem.href)
  if (!test(file)) throw new Error("Not a file")
  return file
}

actions.gh.openFileFromClipboard = async ({ newTab = true } = {}) => {
  const clip = await navigator.clipboard.readText()
  if (typeof clip !== "string" || clip.length === 0) {
    return
  }

  const loc = window.location.href
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
  )
}

// GitLab
// ------
actions.gl = {}
actions.gl.star = () => {
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

// Twitter
// ------
actions.tw = {}
actions.tw.openUser = () =>
  util.createHints([].concat(
    [...document.querySelectorAll("a[role='link'] img[src^='https://pbs.twimg.com/profile_images']")]
      .map((e) => e.closest("a")),
    [...document.querySelectorAll("a[role='link']")]
      .filter((e) => e.text.match(/^@/)),
  ))

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

// Hacker News
// ----------
actions.hn = {}
actions.hn.goParent = () => {
  const par = document.querySelector(".navs>a[href^='item']")
  if (!par) {
    return
  }
  actions.openLink(par.href)
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
    u = new URL(window.location.href)
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
  actions.openLink(u.href)
}

actions.hn.openLinkAndComments = (e) => {
  const linkUrl = e.querySelector(".titleline>a").href
  const commentsUrl = e.nextElementSibling.querySelector("a[href^='item']:not(.titlelink)").href
  actions.openLink(commentsUrl, { newTab: true })
  actions.openLink(linkUrl, { newTab: true })
}

// ProductHunt
// -----------
actions.ph = {}
actions.ph.openExternal = () => {
  Hints.create("ul[class^='postsList_'] > li > div[class^='item_']", (p) => actions.openLink(
    p.querySelector("div[class^='meta_'] > div[class^='actions_'] > div[class^='minorActions_'] > a:nth-child(1)").href,
    { newTab: true },
  ))
}

// Wikipedia
// ---------
actions.wp = {}
actions.wp.toggleSimple = () => {
  const u = new URL(window.location.href)
  u.hostname = u.hostname.split(".")
    .map((s, i) => {
      if (i === 0) {
        return s === "simple" ? "" : "simple"
      }
      return s
    }).filter((s) => s !== "").join(".")
  actions.openLink(u.href)
}

actions.wp.viewWikiRank = () => {
  const h = document.location.hostname.split(".")
  const lang = h.length > 2 && h[0] !== "www" ? h[0] : "en"
  const p = document.location.pathname.split("/")
  if (p.length < 3 || p[1] !== "wiki") {
    return
  }
  const article = p.slice(2).join("/")
  actions.openLink(`https://wikirank.net/${lang}/${article}`, { newTab: true })
}

actions.wp.markdownSummary = () =>
  `> ${
    [
      (acc) => [...acc.querySelectorAll("sup")].map((e) => e.remove()),
      (acc) => [...acc.querySelectorAll("b")].forEach((e) => { e.innerText = `**${e.innerText}**` }),
      (acc) => [...acc.querySelectorAll("i")].forEach((e) => { e.innerText = `_${e.innerText}_` }),
    ].reduce(
      (acc, f) => (f(acc) && false) || acc,
      document.querySelector("#mw-content-text p:not([class]):not([id])").cloneNode(true),
    ).innerText.trim()}

— ${actions.getMarkdownLink()}`

// Nest Thermostat Controller
// --------------------------
actions.nt = {}
actions.nt.adjustTemp = (dir) =>
  document.querySelector(
    `button[data-test='thermozilla-controller-controls-${dir > 0 ? "in" : "de"}crement-button']`,
  ).click()

actions.nt.setMode = async (mode) => {
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

actions.nt.setFan = async (desiredState) => {
  const startStopFan = async (startStop, popover) => {
    const query = () => !popover.isConnected
    const q = query()
    if (q) return q
    popover.querySelector(`div[data-test='thermozilla-fan-timer-${startStop}-button']`).click()
    return util.until(query)
  }

  const selectFanTime = async (listbox) => {
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
    await selectFanTime(listbox)
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

// rescript-lang.org
actions.re = {}
actions.re.focusSearch = () => actions.dispatchMouseEvents(document.getElementById("docsearch"), "mousedown", "click")

actions.re.scrollSidebar = (dir) => actions.scrollElement(document.getElementById("sidebar-content"), dir)
actions.re.scrollContent = (dir) => actions.scrollElement(document.body, dir)

// devdocs.io
actions.dv = {}

actions.dv.scrollSidebar = (dir) => actions.scrollElement(document.querySelector("._list"), dir)
actions.dv.scrollContent = (dir) => actions.scrollElement(document.querySelector("._content"), dir)

// ikea.com
actions.ik = {}

actions.ik.toggleProductDetails = async () => {
  const closeButtonQuery = () => document.querySelector(".range-revamp-modal-header__close")
  const expandButtonQuery = () => document.querySelector(".range-revamp-expander__btn")
  const productDetailsButtonQuery = () => document.querySelector(".range-revamp-product-information-section__button button")

  const openProductDetailsModal = async () => {
    productDetailsButtonQuery().click()
    const expandButton = expandButtonQuery()
    if (expandButton) return expandButton
    return util.until(expandButtonQuery)
  }

  const closeButton = closeButtonQuery()
  if (closeButton) {
    closeButton.click()
    return
  }

  const expandButton = await openProductDetailsModal()
  if (expandButton) expandButton.click()
}

actions.ik.toggleProductReviews = () => {
  const btn = document.querySelector(".ugc-rr-pip-fe-modal-header__close") ?? document.querySelector(".range-revamp-chunky-header__reviews")
  if (btn) btn.click()
}

// youtube.com
actions.yt = {}
actions.yt.getCurrentTimestamp = () => {
  const [ss, mm, hh = 0] = (document
    .querySelector("#ytd-player .ytp-time-current")
    ?.innerText
    ?.split(":")
    ?.reverse()
    ?.map(Number)) ?? [0, 0, 0]
  return (hh * 60 * 60) + (mm * 60) + ss
}

actions.yt.getShortLink = () => {
  const params = new URLSearchParams(window.location.search)
  return `https://youtu.be/${params.get("v")}`
}

actions.yt.getCurrentTimestampLink = () =>
  `${actions.yt.getShortLink()}?t=${actions.yt.getCurrentTimestamp()}`

actions.yt.getCurrentTimestampMarkdownLink = () =>
  actions.getMarkdownLink({ href: actions.yt.getCurrentTimestampLink() })

export default actions
