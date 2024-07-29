import priv from "./conf.priv.js"
import util from "./util.js"

const {
  htmlPurify,
  htmlNode,
  htmlForEach,
  suggestionItem,
  urlItem,
  prettyDate,
  getDuckduckgoFaviconUrl,
  localStorage,
  runtimeHttpRequest,
} = util

// TODO: use a Babel loader to import this image
const wpDefaultIcon =
  "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2056%2056%22%20enable-background%3D%22new%200%200%2056%2056%22%3E%0A%20%20%20%20%3Cpath%20fill%3D%22%23eee%22%20d%3D%22M0%200h56v56h-56z%22%2F%3E%0A%20%20%20%20%3Cpath%20fill%3D%22%23999%22%20d%3D%22M36.4%2013.5h-18.6v24.9c0%201.4.9%202.3%202.3%202.3h18.7v-25c.1-1.4-1-2.2-2.4-2.2zm-6.2%203.5h5.1v6.4h-5.1v-6.4zm-8.8%200h6v1.8h-6v-1.8zm0%204.6h6v1.8h-6v-1.8zm0%2015.5v-1.8h13.8v1.8h-13.8zm13.8-4.5h-13.8v-1.8h13.8v1.8zm0-4.7h-13.8v-1.8h13.8v1.8z%22%2F%3E%0A%3C%2Fsvg%3E%0A"

const locale = typeof navigator !== "undefined" ? navigator.language : ""

const localServer = "http://localhost:9919"

const completions = {}

const googleCustomSearch = (opts) => {
  let favicon = "https://google.com/favicon.ico"
  if (opts.favicon) {
    favicon = opts.favicon
  } else if (opts.domain) {
    favicon = getDuckduckgoFaviconUrl(`https://${opts.domain}`)
  } else if (opts.search) {
    favicon = getDuckduckgoFaviconUrl(opts.search)
  }
  return {
    favicon,
    compl: `https://www.googleapis.com/customsearch/v1?key=${
      priv.keys.google_cs
    }&cx=${priv.keys[`google_cx_${opts.alias}`]}&q=`,
    search: `https://cse.google.com/cse/publicurl?cx=${
      priv.keys[`google_cx_${opts.alias}`]
    }&q=`,
    callback: (response) =>
      JSON.parse(response.text).items.map(
        (s) => suggestionItem({ url: s.link })`
        <div>
          <div class="title"><strong>${htmlPurify(s.htmlTitle)}</strong></div>
          <div>${htmlPurify(s.htmlSnippet)}</div>
        </div>
      `
      ),
    priv: true,
    ...opts,
  }
}

// ****** Arch Linux ****** //

// Arch Linux official repos
completions.al = googleCustomSearch({
  alias: "al",
  name: "archlinux",
  search: "https://www.archlinux.org/packages/?arch=x86_64&q=",
})

// Arch Linux AUR
completions.au = {
  alias: "au",
  name: "AUR",
  search:
    "https://aur.archlinux.org/packages/?O=0&SeB=nd&outdated=&SB=v&SO=d&PP=100&do_Search=Go&K=",
  compl: "https://aur.archlinux.org/rpc?v=5&type=suggest&arg=",
}

completions.au.callback = (response) => {
  const res = JSON.parse(response.text)
  return res.map((s) => urlItem(s, `https://aur.archlinux.org/packages/${s}`))
}

// Arch Linux Wiki
completions.aw = {
  alias: "aw",
  name: "archwiki",
  search: "https://wiki.archlinux.org/index.php?go=go&search=",
  compl:
    "https://wiki.archlinux.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.aw.callback = (response) => JSON.parse(response.text)[1]

// Arch Linux Forums
completions.af = googleCustomSearch({
  alias: "af",
  name: "archforums",
  domain: "bbs.archlinux.org",
})

// ****** Technical Resources ****** //

// AWS
// completions.aw = {
//   alias:  "aw",
//   name:   "aws",
//   search: "https://aws.amazon.com/search/?searchQuery=",
//   compl:  "https://aws.amazon.com/api/dirs/typeahead-suggestions/items?locale=en_US&limit=250#",
// }
//
// completions.aw.callback = (response) => {
//   console.log({ response })
//   const res = JSON.parse(response.text)
//   return res.items.map((s) => {
//     const { name } = s
//     return createSuggestionItem(`
//       <div style="padding:5px;display:grid;grid-template-columns:60px 1fr;grid-gap:15px">
//         <!-- <img style="width:60px" src="\${icUrl}" alt="\${escape(s.Name)}"> -->
//         <div>
//           <div class="title"><strong>${name}</strong> ${s.additionalFields.desc}</div>
//         </div>
//       </div>
//     `, { url: `https://${s.additionalFields.primaryUrl}` })
//   })
// }

// AlternativeTo
completions.at = {
  alias: "at",
  name: "alternativeTo",
  search: "https://alternativeto.net/browse/search/?q=",
  compl: `https://zidpns2vb0-dsn.algolia.net/1/indexes/fullitems?x-algolia-application-id=ZIDPNS2VB0&x-algolia-api-key=${priv.keys.alternativeTo}&attributesToRetrieve=Name,UrlName,TagLine,Description,Likes,HasIcon,IconId,IconExtension,InternalUrl&query=`,
  priv: true,
}

completions.at.callback = async (response) => {
  const res = JSON.parse(response.text)
  return res.hits.map((s) => {
    let title = s.Name
    let prefix = ""
    if (s._highlightResult) {
      if (s._highlightResult.Name) {
        title = s._highlightResult.Name.value
      }
    }
    if (s.Likes) {
      prefix += `[↑${parseInt(s.Likes, 10)}] `
    }
    const icon = s.HasIcon
      ? `https://d2.alternativeto.net/dist/icons/${s.UrlName}_${s.IconId}${s.IconExtension}?width=100&height=100&mode=crop&upscale=false`
      : wpDefaultIcon

    return suggestionItem({ url: `https://${s.InternalUrl}` })`
      <div style="padding:5px;display:grid;grid-template-columns:60px 1fr;grid-gap:15px">
        <img style="width:60px" src="${icon}" alt="${s.Name}">
        <div>
          <div class="title"><strong>${prefix}${htmlPurify(
      title
    )}</strong></div>
          <span>${htmlPurify(s.TagLine || s.Description || "")}</span>
        </div>
      </div>
    `
  })
}

// Chrome Webstore
completions.cs = googleCustomSearch({
  alias: "cs",
  name: "chromestore",
  search: "https://chrome.google.com/webstore/search/",
})

// Firefox

const parseFirefoxAddonsRes = (response) =>
  JSON.parse(response.text).results.map((s) => {
    let { name } = s
    if (typeof name === "object") {
      if (name[navigator.language] !== undefined) {
        name = name[navigator.language]
      } else {
        ;[name] = Object.values(name)
      }
    }
    let prefix = ""
    switch (s.type) {
      case "extension":
        prefix += "🧩 "
        break
      case "statictheme":
        prefix += "🖌 "
        break
      default:
        break
    }

    return suggestionItem({ url: s.url })`
    <div style="padding:5px;display:grid;grid-template-columns:2em 1fr;grid-gap:15px">
        <img style="width:2em" src="${s.icon_url}">
        <div>
          <div class="title"><strong>${prefix}${name}</strong></div>
        </div>
      </div>
    `
  })

// Firefox Addons
completions.fa = {
  alias: "fa",
  name: "firefox-addons",
  search: `https://addons.mozilla.org/${locale}/firefox/search/?q=`,
  compl: "https://addons.mozilla.org/api/v4/addons/autocomplete/?q=",
  callback: parseFirefoxAddonsRes,
}

// Firefox Themes
completions.ft = {
  alias: "ft",
  name: "firefox-themes",
  search: `https://addons.mozilla.org/${locale}/firefox/search/?type=statictheme&q=`,
  compl:
    "https://addons.mozilla.org/api/v4/addons/autocomplete/?type=statictheme&q=",
  callback: parseFirefoxAddonsRes,
}

// Firefox Extensions
completions.fe = {
  alias: "fe",
  name: "firefox-extensions",
  search: `https://addons.mozilla.org/${locale}/firefox/search/?type=extension&q=`,
  compl:
    "https://addons.mozilla.org/api/v4/addons/autocomplete/?type=extension&q=",
  callback: parseFirefoxAddonsRes,
}

// OWASP Wiki
completions.ow = {
  alias: "ow",
  name: "owasp",
  search: "https://www.owasp.org/index.php?go=go&search=",
  compl:
    "https://www.owasp.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.ow.callback = (response) => JSON.parse(response.text)[1]

// StackOverflow
completions.so = {
  alias: "so",
  name: "stackoverflow",
  search: "https://stackoverflow.com/search?q=",
  compl:
    "https://api.stackexchange.com/2.2/search/advanced?pagesize=10&order=desc&sort=relevance&site=stackoverflow&q=",
}

completions.so.callback = (response) =>
  JSON.parse(response.text).items.map((s) =>
    urlItem(`[${s.score}] ${s.title}`, s.link, { query: false })
  )

// StackExchange - all sites
completions.se = {
  alias: "se",
  name: "stackexchange",
  search: "https://stackexchange.com/search?q=",
  compl: "https://duckduckgo.com/ac/?q=!stackexchange%20",
}

completions.se.callback = (response) =>
  JSON.parse(response.text).map((r) => r.phrase.replace(/^!stackexchange /, ""))

// DockerHub repo search
completions.dh = {
  alias: "dh",
  name: "dockerhub",
  search: "https://hub.docker.com/search/?page=1&q=",
  compl: "https://hub.docker.com/v2/search/repositories/?page_size=20&query=",
}

completions.dh.callback = (response) =>
  JSON.parse(response.text).results.map((s) => {
    let meta = ""
    let repo = s.repo_name
    meta += `[★${s.star_count}] `
    meta += `[↓${s.pull_count}] `
    if (repo.indexOf("/") === -1) {
      repo = `_/${repo}`
    }
    return suggestionItem({ url: `https://hub.docker.com/r/${repo}` })`
      <div>
        <div class="title"><strong>${repo}</strong></div>
        <div>${meta}</div>
        <div>${s.short_description}</div>
      </div>
    `
  })

// GitHub
completions.gh = {
  alias: "gh",
  name: "github",
  search: "https://github.com/search?q=",
  compl: "https://api.github.com/search/repositories?sort=stars&order=desc&q=",
}

completions.gh.callback = (response) =>
  JSON.parse(response.text).items.map((s) => {
    let prefix = ""
    if (s.stargazers_count) {
      prefix += `[★${parseInt(s.stargazers_count, 10)}] `
    }
    return urlItem(prefix + s.full_name, s.html_url, {
      query: s.full_name,
      desc: s.description,
    })
  })

// Domainr domain search
completions.do = {
  alias: "do",
  name: "domainr",
  search: "https://domainr.com/?q=",
  compl: "https://5jmgqstc3m.execute-api.us-west-1.amazonaws.com/v1/domainr?q=",
}

completions.do.callback = (response) =>
  Object.entries(JSON.parse(response.text)).map(([domain, data]) => {
    const [color = "inherit", symbol = "?"] =
      {
        inactive: ["#23b000", "✔"],
        active: ["#ff4d00", "✘"],
      }[data.summary] ?? []
    return suggestionItem({ url: `https://domainr.com/${domain}` })`
      <div class="title" style="${`color: ${color}`}"><strong>${symbol} ${domain}</strong></div>
    `
  })

// Vim Wiki
completions.vw = {
  alias: "vw",
  name: "vimwiki",
  search: "https://vim.fandom.com/wiki/Special:Search?query=",
  compl:
    "https://vim.fandom.com/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.vw.callback = (response) =>
  JSON.parse(response.text)[1].map((r) =>
    urlItem(r, `https://vim.fandom.com/wiki/${encodeURIComponent(r)}`, {
      query: false,
    })
  )

// ****** Shopping & Food ****** //

// Amazon
completions.az = {
  alias: "az",
  name: "amazon",
  search: "https://smile.amazon.com/s/?field-keywords=",
  compl:
    "https://completion.amazon.com/search/complete?method=completion&mkt=1&search-alias=aps&q=",
}

completions.az.callback = (response) => JSON.parse(response.text)[1]

// Craigslist
completions.cl = {
  alias: "cl",
  name: "craigslist",
  search: "https://www.craigslist.org/search/sss?query=",
  compl:
    "https://www.craigslist.org/suggest?v=12&type=search&cat=sss&area=1&term=",
}

completions.cl.callback = (response) => JSON.parse(response.text)

// EBay
completions.eb = {
  alias: "eb",
  name: "ebay",
  search: "https://www.ebay.com/sch/i.html?_nkw=",
  compl: "https://autosug.ebay.com/autosug?callback=0&sId=0&kwd=",
}

completions.eb.callback = (response) => JSON.parse(response.text).res.sug

// Yelp
completions.yp = {
  alias: "yp",
  name: "yelp",
  search: "https://www.yelp.com/search?find_desc=",
  compl: "https://www.yelp.com/search_suggest/v2/prefetch?prefix=",
}

completions.yp.callback = (response) => {
  const res = JSON.parse(response.text).response
  const words = []
  res.forEach((r) => {
    r.suggestions.forEach((s) => {
      const w = s.query
      if (words.indexOf(w) === -1) {
        words.push(w)
      }
    })
  })
  return words
}

// ****** General References, Calculators & Utilities ****** //
completions.un = {
  alias: "un",
  name: "unicode",
  search: "https://symbl.cc/en/search/?q=",
  compl: `${localServer}/s/unicode?q=`,
  local: true,
}

completions.un.callback = (response) => {
  const res = JSON.parse(response.text).slice(0, 20)
  const titleCase = (s) =>
    s
      .split(" ")
      .map(
        (word) =>
          `${word[0]?.toUpperCase() ?? ""}${
            word.length > 1 ? word.slice(1) : ""
          }`
      )
      .join(" ")
  const codeSpanStyle =
    "font-family: monospace; background-color: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.4); border-radius: 5px; padding: 2px 4px; opacity: 70%"
  return res.map(
    ({ symbol, name, value }) =>
      suggestionItem({
        url: `https://symbl.cc/en/${value}`,
        copy: symbol,
      })`
      <div>
        <span style="font-size: 2em; font-weight: bold; min-width: 1em; margin-left: 0.5em; display: inline-block">${symbol}</span>
        <span style="${codeSpanStyle}">U+${value}</span>
        <span style="${codeSpanStyle}">&amp;#${parseInt(value, 16)};</span>
        <span>${titleCase(name.toLowerCase())}</span>
      </div>
    `
  )
}

const parseDatamuseRes = (res, o = {}) => {
  const opts = {
    maxDefs: -1,
    ellipsis: false,
    ...o,
  }
  return res.map((r) => {
    const defs = []
    let defsHtml = ""
    if (
      (opts.maxDefs <= -1 || opts.maxDefs > 0) &&
      r.defs &&
      r.defs.length > 0
    ) {
      for (const d of r.defs.slice(
        0,
        opts.maxDefs <= -1 ? undefined : opts.maxDefs
      )) {
        const ds = d.split("\t")
        const partOfSpeech = `(${ds[0]})`
        const def = ds[1]
        defs.push(`<span><em>${partOfSpeech}</em> ${def}</span>`)
      }
      if (opts.ellipsis && r.defs.length > opts.maxDefs) {
        defs.push("<span><em>&hellip;</em></span>")
      }
      defsHtml = `<div>${defs.join("<br />")}</div>`
    }
    return suggestionItem({ url: `${opts.wordBaseURL}${r.word}` })`
      <div>
        <div class="title"><strong>${r.word}</strong></div>
        ${htmlPurify(defsHtml)}
      </div>
    `
  })
}

// Dictionary
completions.de = {
  alias: "de",
  name: "define",
  search: "http://onelook.com/?w=",
  compl: "https://api.datamuse.com/words?md=d&sp=%s*",
  opts: {
    maxDefs: 16,
    ellipsis: true,
    wordBaseURL: "http://onelook.com/?w=",
  },
}

completions.de.callback = (response) => {
  const res = JSON.parse(response.text)
  return parseDatamuseRes(res, completions.de.opts)
}

// Thesaurus
completions.th = {
  alias: "th",
  name: "thesaurus",
  search: "https://www.onelook.com/thesaurus/?s=",
  compl: "https://api.datamuse.com/words?md=d&ml=%s",
  opts: {
    maxDefs: 3,
    ellipsis: true,
    wordBaseURL: "http://onelook.com/thesaurus/?s=",
  },
}

completions.th.callback = (response) => {
  const res = JSON.parse(response.text)
  return parseDatamuseRes(res, completions.th.opts)
}

// Wikipedia
completions.wp = {
  alias: "wp",
  name: "wikipedia",
  search: "https://en.wikipedia.org/w/index.php?search=",
  compl:
    "https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=info|pageprops%7Cpageimages%7Cdescription&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=6&inprop=url&gpssearch=",
}

completions.wp.callback = (response) =>
  Object.values(JSON.parse(response.text).query.pages).map((p) => {
    const img = p.thumbnail ? p.thumbnail.source : wpDefaultIcon
    return suggestionItem({ url: p.fullurl })`
      <div style="padding:5px;display:grid;grid-template-columns:60px 1fr;grid-gap:15px">
        <img style="width:60px" src="${img}">
        <div>
          <div class="title"><strong>${p.title}</strong></div>
          <div class="title">${p.description ?? ""}</div>
        </div>
      </div>
    `
  })

// Wikipedia - Simple English version
completions.ws = {
  alias: "ws",
  name: "wikipedia-simple",
  search: "https://simple.wikipedia.org/w/index.php?search=",
  compl:
    "https://simple.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=info|pageprops%7Cpageimages%7Cdescription&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=6&inprop=url&gpssearch=",
  callback: completions.wp.callback,
}

// Wiktionary
completions.wt = {
  alias: "wt",
  name: "wiktionary",
  search: "https://en.wiktionary.org/w/index.php?search=",
  compl:
    "https://en.wiktionary.org/w/api.php?action=query&format=json&generator=prefixsearch&gpssearch=",
}

completions.wt.callback = (response) =>
  Object.values(JSON.parse(response.text).query.pages).map((p) => p.title)

// WolframAlpha
completions.wa = {
  alias: "wa",
  name: "wolframalpha",
  search: "http://www.wolframalpha.com/input/?i=",
  compl: `http://api.wolframalpha.com/v2/query?appid=${priv.keys.wolframalpha}&format=plaintext,image&output=json&reinterpret=true&input=%s`,
  priv: true,
}

completions.wa.callback = (response, { query }) => {
  const res = JSON.parse(response.text).queryresult

  if (res.error) {
    return [
      suggestionItem({ url: "https://www.wolframalpha.com/" })`
        <div>
          <div class="title"><strong>Error</strong> (Code ${res.error.code})</div>
          <div class="title">${res.error.msg}</div>
        </div>
      `,
    ]
  }

  if (!res.success) {
    if (res.tips) {
      return [
        suggestionItem({ url: "https://www.wolframalpha.com/" })`
          <div>
            <div class="title"><strong>No Results</strong></div>
            <div class="title">${res.tips.text}</div>
          </div>
        `,
      ]
    }
    if (res.didyoumeans) {
      return res.didyoumeans.map(
        (s) =>
          suggestionItem({ url: "https://www.wolframalpha.com/" })`
          <div>
            <div class="title"><strong>Did you mean...?</strong></div>
            <div class="title">${s.val}</div>
          </div>
        `
      )
    }
    return [
      suggestionItem({ url: "https://www.wolframalpha.com/" })`
        <div>
          <div class="title"><strong>Error</strong></div>
          <div class="title">An unknown error occurred.</div>
        </div>
      `,
    ]
  }

  const results = []
  res.pods.forEach((p) => {
    const result = {
      title: p.title,
      values: [],
      url: `http://www.wolframalpha.com/input/?i=${encodeURIComponent(query)}`,
    }
    if (p.numsubpods > 0) {
      if (p.subpods[0].plaintext) {
        result.url = encodeURIComponent(p.subpods[0].plaintext)
        result.copy = p.subpods[0].plaintext
      }
      p.subpods.forEach((sp) => {
        let v = ""
        if (sp.title) {
          v = htmlNode`<strong>${sp.title}</strong>: `
        }
        if (sp.img) {
          v = htmlNode`
            <div>${v}</div>
            <div>
              <img
                src="${sp.img.src}"
                width="${sp.img.width}"
                height="${sp.img.height}"
                style="margin-top: 6px; padding: 12px; border-radius: 12px; background: white"
              >
            </div>
          `
        } else if (sp.plaintext) {
          v = `${v}${sp.plaintext}`
        }
        if (v) {
          v = htmlNode`<div class="title">${v}</div>`
        }
        result.values.push(v)
      })
    }
    if (result.values.length > 0) {
      results.push(result)
    }
  })

  return results.map(
    (r) => suggestionItem({ url: r.url, copy: r.copy, query: r.query })`
    <div>
      <div class="title"><strong>${r.title}</strong></div>
      ${htmlForEach(r.values)}
    </div>`
  )
}

// ****** Search Engines ****** //

// DuckDuckGo
completions.dd = {
  alias: "du",
  name: "duckduckgo",
  search: "https://duckduckgo.com/?q=",
  compl: "https://duckduckgo.com/ac/?q=",
}

completions.dd.callback = (response) =>
  JSON.parse(response.text).map((r) => r.phrase)

// DuckDuckGo - I'm Feeling Lucky
completions.D = {
  alias: "D",
  name: "duckduckgo-lucky",
  search: "https://duckduckgo.com/?q=\\",
  compl: "https://duckduckgo.com/ac/?q=\\",
  callback: completions.dd.callback,
}

// DuckDuckGo Images
completions.di = {
  alias: "di",
  name: "duckduckgo-images",
  search: "https://duckduckgo.com/?ia=images&iax=images&q=",
  compl: "https://duckduckgo.com/ac/?ia=images&iax=images&q=",
  callback: completions.dd.callback,
}

// DuckDuckGo Videos
completions.dv = {
  alias: "dv",
  name: "duckduckgo-videos",
  search: "https://duckduckgo.com/?ia=videos&iax=videos&q=",
  compl: "https://duckduckgo.com/ac/?ia=videos&iax=videos&q=",
  callback: completions.dd.callback,
}

// DuckDuckGo News
completions.dn = {
  alias: "dn",
  name: "duckduckgo-news",
  search: "https://duckduckgo.com/?iar=news&ia=news&q=",
  compl: "https://duckduckgo.com/ac/?iar=news&ia=news&q=",
  callback: completions.dd.callback,
}

// DuckDuckGo Maps
completions.dm = {
  alias: "dm",
  name: "duckduckgo-maps",
  search: "https://duckduckgo.com/?ia=maps&iax=maps&iaxm=places&q=",
  compl: "https://duckduckgo.com/ac/?ia=maps&iax=maps&iaxm=places&q=",
  callback: completions.dd.callback,
}

// Google
completions.go = {
  alias: "go",
  name: "google",
  search: "https://www.google.com/search?q=",
  compl:
    "https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&q=",
}

completions.go.callback = (response) => JSON.parse(response.text)[1]

// Google Images
completions.gi = {
  alias: "gi",
  name: "google-images",
  search: "https://www.google.com/search?tbm=isch&q=",
  compl:
    "https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&ds=i&q=",
  callback: completions.go.callback,
}

// Google Images (reverse image search by URL)
completions.gI = {
  alias: "gI",
  name: "google-reverse-image",
  search: "https://www.google.com/searchbyimage?image_url=",
}

// Google - I'm Feeling Lucky
completions.G = {
  alias: "G",
  name: "google-lucky",
  search: "https://www.google.com/search?btnI=1&q=",
  compl:
    "https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&q=",
  callback: completions.go.callback,
}

// Google Scholar
completions.gs = {
  alias: "gs",
  name: "google-scholar",
  search: "https://scholar.google.com/scholar?q=",
  compl: "https://scholar.google.com/scholar_complete?q=",
}

completions.gs.callback = (response) => JSON.parse(response.text).l

// Kagi
completions.ka = {
  alias: "ka",
  name: "kagi",
  search: "https://kagi.com/search?q=",
  compl: "https://kagi.com/autosuggest?q=",
  callback: (response) =>
    JSON.parse(response.text).map((r) => {
      const u = new URL("https://kagi.com/search")
      u.searchParams.append("q", r.t)
      if (r.goto) {
        u.href = r.goto
      }
      return suggestionItem({ url: u.href })`
      <div style="padding: 5px; display: grid; grid-template-columns: 32px 1fr; grid-gap: 15px">
        <img style="width: 32px" src="${
          r.img ? new URL(r.img, "https://kagi.com") : wpDefaultIcon
        }" />
        <div>
          <div class="title"><strong>${r.t}</strong></div>
          <div class="title">${r.txt ?? ""}</div>
        </div>
      </div>
    `
    }),
}

//  ****** Elixir ****** //

// Hex.pm
completions.hx = {
  alias: "hx",
  name: "hex",
  search: "https://hex.pm/packages?sort=downloads&search=",
  compl: "https://hex.pm/api/packages?sort=downloads&hx&search=",
}

completions.hx.callback = (response) =>
  JSON.parse(response.text).map(
    (s) =>
      suggestionItem({ url: s.html_url })`
    <div>
      <div class="title">${s.repository}/<strong>${s.name}</strong></div>
      <div>${s.downloads?.all ? `[↓${s.downloads.all}]` : ""}</div>
      <div>${s.meta?.description ?? ""}</div>
    </div>
  `
  )

// hexdocs
// Same as hex but links to documentation pages
completions.hd = {
  alias: "hd",
  name: "hexdocs",
  search: "https://hex.pm/packages?sort=downloads&search=",
  compl: "https://hex.pm/api/packages?sort=downloads&hd&search=",
}

completions.hd.callback = (response) =>
  JSON.parse(response.text).map(
    (s) =>
      suggestionItem({
        url: `https://hexdocs.pm/${encodeURIComponent(s.name)}`,
      })`
    <div>
      <div class="title">${s.repository}/<strong>${s.name}</strong></div>
      <div>${s.downloads?.all ? `[↓${s.downloads.all}]` : ""}</div>
      <div>${s.meta?.description ?? ""}</div>
    </div>
  `
  )

// ****** Golang ****** //

// Golang Docs
completions.gg = googleCustomSearch({
  alias: "gg",
  name: "golang",
  domain: "golang.org",
})

// Godoc
// TODO: migrate to pkg.go.dev
// completions.gd = {
//   alias:  "gd",
//   name:   "godoc",
//   search: "https://godoc.org/?q=",
//   compl:  "https://api.godoc.org/search?q=",
// }
//
// completions.gd.callback = (response) => JSON.parse(response.text).results.map((s) => {
//   let prefix = ""
//   if (s.import_count) {
//     prefix += `[↓${s.import_count}] `
//   }
//   if (s.stars) {
//     prefix += `[★${s.stars}] `
//   }
//   return urlItem(prefix + s.path, `https://godoc.org/${s.path}`)
// })

// ****** Haskell ****** //

// Hackage
// TODO: Re-enable
// completions.ha = {
//   alias:  "ha",
//   name:   "hackage",
//   search: "https://hackage.haskell.org/packages/search?terms=",
//   compl:  "https://hackage.haskell.org/packages/search.json?terms=",
// }
//
// completions.ha.callback = (response) => JSON.parse(response.text)
//   .map((s) => urlItem(s.name, `https://hackage.haskell.org/package/${s.name}`))

// Hoogle
completions.ho = {
  alias: "ho",
  name: "hoogle",
  search: "https://www.haskell.org/hoogle/?hoogle=",
  compl: "https://www.haskell.org/hoogle/?mode=json&hoogle=",
}

completions.ho.callback = (response) =>
  JSON.parse(response.text).map((s) => {
    const pkgInfo =
      s.package.name && s.module.name
        ? htmlNode`<div style="font-size:0.8em; margin-bottom: 0.8em; margin-top: 0.8em">[${s.package.name}] ${s.module.name}</div>`
        : ""
    return suggestionItem({ url: s.url })`
    <div>
      <div class="title" style="font-size: 1.1em; font-weight: bold">${htmlPurify(
        s.item
      )}</div>
      ${pkgInfo}
      <div style="padding: 0.5em">${htmlPurify(s.docs)}</div>
    </div>
  `
  })

// Haskell Wiki
completions.hw = {
  alias: "hw",
  name: "haskellwiki",
  search: "https://wiki.haskell.org/index.php?go=go&search=",
  compl:
    "https://wiki.haskell.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.hw.callback = (response) => JSON.parse(response.text)[1]

// ****** HTML, CSS, JavaScript, NodeJS, ... ****** //

// caniuse
completions.ci = {
  alias: "ci",
  name: "caniuse",
  search: "https://caniuse.com/?search=",
  compl: "https://caniuse.com/process/query.php?search=",
  favicon: "https://caniuse.com/img/favicon-128.png",
}

completions.ci.getData = async () => {
  const storageKey = "completions.ci.data"
  const storedData = await localStorage.get(storageKey)
  if (storedData) {
    return JSON.parse(storedData)
  }
  const data = JSON.parse(
    await runtimeHttpRequest("https://caniuse.com/data.json")
  )
  localStorage.set(storageKey, JSON.stringify(data))
  return data
}

completions.ci.callback = async (response) => {
  const { featureIds } = JSON.parse(response.text)
  const allData = await completions.ci.getData()
  return featureIds
    .map((featId) => {
      const feat = allData.data[featId]
      return feat
        ? suggestionItem({ url: `https://caniuse.com/${featId}` })`
          <div>
            <div class="title"><strong>${feat.title}</strong></div>
            <div>${feat.description}</div>
          </div>
        `
        : null
    })
    .filter((item) => !!item)
}

// jQuery API documentation
completions.jq = googleCustomSearch({
  alias: "jq",
  name: "jquery",
  domain: "jquery.com",
})

// NodeJS standard library documentation
completions.no = googleCustomSearch({
  alias: "no",
  name: "node",
  domain: "nodejs.org",
})

// Mozilla Developer Network (MDN)
completions.md = {
  alias: "md",
  name: "mdn",
  search: "https://developer.mozilla.org/search?q=",
  compl: "https://developer.mozilla.org/api/v1/search?q=",
}

completions.md.callback = (response) => {
  const res = JSON.parse(response.text)
  return res.documents.map(
    (s) =>
      suggestionItem({
        url: `https://developer.mozilla.org/${s.locale}/docs/${s.slug}`,
      })`
      <div>
        <div class="title"><strong>${s.title}</strong></div>
        <div style="font-size:0.8em"><em>${s.slug}</em></div>
        <div>${s.summary}</div>
      </div>
    `
  )
}

// NPM registry search
completions.np = {
  alias: "np",
  name: "npm",
  search: "https://www.npmjs.com/search?q=",
  compl: "https://api.npms.io/v2/search/suggestions?size=20&q=",
  favicon: getDuckduckgoFaviconUrl("https://www.npmjs.com"),
}

completions.np.callback = (response) =>
  JSON.parse(response.text).map((s) => {
    const desc = s.package?.description ? s.package.description : ""
    const date = s.package?.date ? prettyDate(new Date(s.package.date)) : ""
    const flags = s.flags
      ? Object.keys(s.flags).map(
          (f) => htmlNode`[<span style='color:#ff4d00'>⚑</span> ${f}] `
        )
      : []
    return suggestionItem({ url: s.package.links.npm })`
      <div>
        <div>
          <span class="title">${htmlPurify(s.highlight)}</span>
          <span style="font-size: 0.8em">v${s.package.version}</span>
        </div>
        <div>
          <i style="alpha: 0.7; font-size: 0.8em">${date}</i>
          <span>${htmlForEach(flags)}</span>
        </div>
        <div>${desc}</div>
      </div>
    `
  })

// TypeScript docs
completions.ts = {
  alias: "ts",
  name: "typescript",
  domain: "www.typescriptlang.org",
  search: "https://duckduckgo.com/?q=site%3Awww.typescriptlang.org+",
  compl: `https://bgcdyoiyz5-dsn.algolia.net/1/indexes/typescriptlang?x-algolia-application-id=BGCDYOIYZ5&x-algolia-api-key=37ee06fa68db6aef451a490df6df7c60&query=`,
  favicon: "https://www.typescriptlang.org/favicon-32x32.png",
}

completions.ts.callback = async (response) => {
  const res = JSON.parse(response.text)
  return Object.entries(res.hits.reduce((acc, hit) => {
    const lvl0 = hit.hierarchy.lvl0
    if (!acc[lvl0]) {
      acc[lvl0] = []
    }
    acc[lvl0].push(hit)
    return acc
  }, {}))
    .sort(([lvl0A], [lvl0B]) => lvl0A.localeCompare(lvl0B))
    .flatMap(([lvl0, hits]) => {
      return hits.map((hit) => {
        console.log(hit)
        const lvl = hit.type
        const hierarchy = Object.entries(hit.hierarchy).reduce(
          (acc, [lvl, name]) => {
            if (!name || lvl === hit.type) {
              return acc
            }
            return `${acc ? acc + " > " : ""}${name}`
          },
          ""
        )
        const title = hit.hierarchy[lvl]
        const desc = hit.content
        return suggestionItem({ url: hit.url })`
          <div>
            <div style="font-weight: bold">
              <span style="opacity: 0.6">${htmlPurify(hierarchy)}${title ? " > " : ""}</span>
              <span style="">${htmlPurify(title)}</span>
            </div>
            <div>${htmlPurify(desc)}</div>
            <div style="opacity: 0.6; line-height: 1.3em">${htmlPurify(hit.url)}</div>
          </div>
        `
      })
    })
}

// ****** Social Media & Entertainment ****** //

// Hacker News (YCombinator)
completions.hn = {
  alias: "hn",
  name: "hackernews",
  domain: "news.ycombinator.com",
  search: "https://hn.algolia.com/?query=",
  compl: "https://hn.algolia.com/api/v1/search?tags=(story,comment)&query=",
}

completions.hn.callback = (response) => {
  const res = JSON.parse(response.text)
  return res.hits.map((s) => {
    let title = ""
    let prefix = ""
    if (s.points) {
      prefix += `[↑${s.points}] `
    }
    if (s.num_comments) {
      prefix += `[↲${s.num_comments}] `
    }
    switch (s._tags[0]) {
      case "story":
        title = s.title
        break
      case "comment":
        title = s.comment_text
        break
      default:
        title = s.objectID
    }
    const url = `https://news.ycombinator.com/item?id=${encodeURIComponent(
      s.objectID
    )}`
    return suggestionItem({ url })`
      <div>
        <div class="title">${prefix}${title}</div>
        <div class="url">${url}</div>
      </div>
    `
  })
}

// Twitter
completions.tw = {
  alias: "tw",
  name: "twitter",
  search: "https://twitter.com/search?q=",
  compl: "https://duckduckgo.com/ac/?q=twitter%20",
}

completions.tw.callback = (response, { query }) => {
  const results = JSON.parse(response.text).map((r) => {
    const q = r.phrase.replace(/^twitter /, "")
    return urlItem(q, `https://twitter.com/search?q=${encodeURIComponent(q)}`)
  })
  if (query.length >= 2 && query.match(/^@/)) {
    results.unshift(
      urlItem(
        query,
        `https://twitter.com/${encodeURIComponent(query.replace(/^@/, ""))}`
      )
    )
  }
  return results
}

// Reddit
completions.re = {
  alias: "re",
  name: "reddit",
  search: "https://www.reddit.com/search?sort=relevance&t=all&q=",
  compl:
    "https://api.reddit.com/search?syntax=plain&sort=relevance&limit=20&q=",
}

completions.re.thumbs = {
  default: "https://i.imgur.com/VCm94xa.png",
  image: "https://i.imgur.com/OaAUUaQ.png",
  nsfw: "https://i.imgur.com/lnmJrXP.png",
  self: "https://i.imgur.com/KQ8uYZz.png",
  spoiler: "https://i.imgur.com/gx2tGsv.png",
}

completions.re.callback = async (response, { query }) => {
  const [_, sub, __, q = ""] = query.match(
    /^\s*\/?(r\/[a-zA-Z0-9_]+)(\s+(.*))?/
  ) ?? [null, null, null, query]
  if (sub && q) {
    response = {
      text: await runtimeHttpRequest(
        `https://api.reddit.com/${encodeURIComponent(
          sub
        )}/search?syntax=plain&sort=relevance&restrict_sr=on&limit=20&q=${encodeURIComponent(
          q
        )}`
      ),
    }
  } else if (sub) {
    const res = await runtimeHttpRequest(
      `https://www.reddit.com/api/search_reddit_names.json?typeahead=true&exact=false&query=${encodeURIComponent(
        sub
      )}`
    )
    return JSON.parse(res).names.map((name) =>
      urlItem(`r/${name}`, `https://reddit.com/r/${encodeURIComponent(name)}`, {
        query: `r/${name}`,
      })
    )
  }
  return JSON.parse(response.text).data.children.map(({ data }) => {
    const thumb = data.thumbnail?.match(/^https?:\/\//)
      ? data.thumbnail
      : completions.re.thumbs[data.thumbnail] ??
        completions.re.thumbs["default"]
    const relDate = prettyDate(new Date(parseInt(data.created, 10) * 1000))
    return suggestionItem({
      url: encodeURI(`https://reddit.com${data.permalink}`),
    })`
      <div style="display: flex; flex-direction: row">
        <img style="width: 70px; height: 50px; margin-right: 0.8em" alt="thumbnail" src="${thumb}">
        <div>
          <div>
            <strong><span style="font-size: 1.2em; margin-right: 0.2em">↑</span>${
              data.score
            }</strong> ${
      data.title
    } <span style="font-size: 0.8em; opacity: 60%">(${data.domain})</span>
          </div>
          <div>
            <span style="font-size: 0.8em"><span style="color: opacity: 70%">r/${
              data.subreddit
            }</span> • <span style="color: opacity: 70%">${
      data.num_comments ?? "unknown"
    }</span> <span style="opacity: 60%">comments</span> • <span style="opacity: 60%">submitted ${relDate} by</span> <span style="color: opacity: 70%">${
      data.author
    }</span></span>
          </div>
        </div>
      </div>
    `
  })
}

// YouTube
completions.yt = {
  alias: "yt",
  name: "youtube",
  search: "https://www.youtube.com/search?q=",
  compl: `https://www.googleapis.com/youtube/v3/search?maxResults=20&part=snippet&type=video,channel&key=${priv.keys.google_yt}&safeSearch=none&q=`,
  priv: true,
}

completions.yt.callback = (response) =>
  JSON.parse(response.text)
    .items.map((s) => {
      const thumb = s.snippet.thumbnails.default
      switch (s.id.kind) {
        case "youtube#channel":
          return suggestionItem({
            url: `https://youtube.com/channel/${s.id.channelId}`,
          })`
          <div style="display: flex; flex-direction: row">
            <img style="${`width: ${thumb.width ?? 120}px; height: ${
              thumb.height ?? 90
            }px; margin-right: 0.8em`}" alt="thumbnail" src="${thumb.url}">
            <div>
              <div>
                <strong>${s.snippet.channelTitle}</strong>
              </div>
              <div>
                <span>${s.snippet.description}</span>
              </div>
              <div>
                <span style="font-size: 0.8em"><span style="opacity: 70%">channel</span></span>
              </div>
            </div>
          </div>
        `
        case "youtube#video":
          const relDate = prettyDate(new Date(s.snippet.publishTime))
          return suggestionItem({
            url: `https://youtu.be/${encodeURIComponent(s.id.videoId)}`,
          })`
          <div style="display: flex; flex-direction: row">
            <img style="${`width: ${thumb.width ?? 120}px; height: ${
              thumb.height ?? 90
            }px; margin-right: 0.8em`}" alt="thumbnail" src="${thumb.url}">
            <div>
              <div>
                <strong>${htmlPurify(s.snippet.title)}</strong>
              </div>
              <div>
                <span>${htmlPurify(s.snippet.description)}</span>
              </div>
              <div>
                <span style="font-size: 0.8em"><span style="opacity: 70%">video</span> <span style="opacity: 60%">by</span> <span style="opacity: 70%">${
                  s.snippet.channelTitle
                }</span> • <span style="opacity: 70%">${relDate}</span></span>
              </div>
            </div>
          </div>
        `
        default:
          return null
      }
    })
    .filter((s) => !!s)

// Huggingface
completions.hf = {
  alias: "hf",
  name: "huggingface",
  search: "https://huggingface.co/models?search=",
  compl: "https://huggingface.co/api/quicksearch?type=all&q=",
}

completions.hf.callback = (response) => {
  const res = JSON.parse(response.text)
  // return [
  return [
    ...res.models.map(
      (m) =>
        suggestionItem({
          url: `https://huggingface.co/${m.id}`,
        })`
        <div>
          <div><strong>${m.id}</strong></div>
          <div><span style="font-size: 0.9em; opacity: 70%">model</span></div>
        </div>
     `
    ),
    ...res.datasets.map(
      (d) =>
        suggestionItem({
          url: `https://huggingface.co/datasets/${d.id}`,
        })`
        <div>
          <div><strong>${d.id}</strong></div>
          <div><span style="font-size: 0.9em; opacity: 70%">dataset</span></div>
        </div>
     `
    ),
  ]
}

export default completions
