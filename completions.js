/* global keys:true */

if (typeof keys === "undefined" && typeof require === "function") {
  keys = require("./conf.priv.js") // eslint-disable-line global-require
}

// ****** Helper Functions ****** //
function googleCxCallback(response) {
  const res = JSON.parse(response.text).items
  Omnibar.listResults(res, (s) => {
    const li = $("<li/>").html(`
      <div>
        <div class="title"><strong>${s.htmlTitle}</strong></div>
        <div>${s.htmlSnippet}</div>
      </div>
    `)
    li.data("url", s.link)
    return li
  })
}

function googleCxURL(alias) {
  const key = `google_cx_${alias}`
  return `https://www.googleapis.com/customsearch/v1?key=${keys.google_cs}&cx=${keys[key]}&q=`
}

function googleCxPublicURL(alias) {
  const key = `google_cx_${alias}`
  return `https://cse.google.com/cse/publicurl?cx=${keys[key]}&q=`
}

function escape(str) {
  return String(str).replace(/[&<>"'`=/]/g, s => ({
    "&":  "&amp;",
    "<":  "&lt;",
    ">":  "&gt;",
    "\"": "&quot;",
    "'":  "&#39;",
    "/":  "&#x2F;",
    "`":  "&#x60;",
    "=":  "&#x3D;",
  }[s]))
}

// This is a base64-encoded image used as a placeholder for
// the crunchbase Omnibar results if they don't have an image
const blank = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAAAAAByaaZbAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+EICxEMErRVWUQAAABOdEVYdFJhdyBwcm9maWxlIHR5cGUgZXhpZgAKZXhpZgogICAgICAyMAo0NTc4Njk2NjAwMDA0OTQ5MmEwMDA4MDAwMDAwMDAwMDAwMDAwMDAwCnwMkD0AAAGXSURBVEjH1ZRvc4IwDMb7/T8dbVr/sEPlPJQd3g22GzJdmxVOHaQa8N2WN7wwvyZ5Eh/hngzxTwDr0If/TAK67POxbqxnpgCIx9dkrkEvswYnAFiutFSgtQapS4ejwFYqbXQXBmC+QxawuI/MJb0LiCq0DICNHoZRKQdYLKQZEhATcQmwDYD5GR8DDtfqaYAMActvTiVMaUvqhZPVYhYAK2SBAwGMTHngnc4wVmFPW9L6k1PJxbSCkfvhqolKSQhsWSClizNyxwAWdzIADixQRXRmdWSHthsg+TknaztFMZgC3vh/nG/qo68TLAKrCSrUg1ulp3cH+BpItBp3DZf0lFXVOIDnBdwKkLO4D5Q3QMO6HJ+hUb1NKNWMGJn3jf4ejPKn99CXOtsuyab95obGL/rpdZ7oIJK87iPiumG01drbdggoCZuq/f0XaB8/FbG62Ta5cD97XJwuZUT7ONbZTIK5m94hBuQs8535MsL5xxPw6ZoNj0DiyzhhcyMf9BJ0Jk1uRRpNyb4y0UaM9UI7E8+kt/EHgR/R6042JzmiwgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wOC0xMVQxNzoxMjoxOC0wNDowMLy29LgAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDgtMTFUMTc6MTI6MTgtMDQ6MDDN60wEAAAAAElFTkSuQmCC"

// ****** Completions ****** //
const completions = {}

// ****** Arch Linux ****** //

// Arch Linux official repos
completions.al = {
  alias:    "al",
  name:     "archlinux",
  search:   "https://www.archlinux.org/packages/?arch=x86_64&q=",
  compl:    googleCxURL("al"),
  callback: googleCxCallback,
}

// Arch Linux AUR
completions.au = {
  alias:  "au",
  name:   "AUR",
  search: "https://aur.archlinux.org/packages/?O=0&SeB=nd&outdated=&SB=v&SO=d&PP=100&do_Search=Go&K=",
  compl:  "https://aur.archlinux.org/rpc?type=suggest&arg=",
}

completions.au.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res, s => Omnibar.createURLItem({
    title: s,
    url:   `https://aur.archlinux.org/packages/${s}`,
  }))
}

// Arch Linux Wiki
completions.aw = {
  alias:  "aw",
  name:   "archwiki",
  search: "https://wiki.archlinux.org/index.php?go=go&search=",
  compl:  "https://wiki.archlinux.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.aw.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

// Arch Linux Forums
completions.af = {
  alias:    "af",
  name:     "archforums",
  search:   googleCxPublicURL("af"),
  compl:    googleCxURL("af"),
  callback: googleCxCallback,
}

// ****** Technical Resources ****** //

// Chrome Webstore
completions.cs = {
  alias:    "cs",
  name:     "chromestore",
  search:   "https://chrome.google.com/webstore/search/",
  compl:    googleCxURL("cs"),
  callback: googleCxCallback,
}

// OWASP Wiki
completions.ow = {
  alias:  "ow",
  name:   "owasp",
  search: "https://www.owasp.org/index.php?go=go&search=",
  compl:  "https://www.owasp.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.ow.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

// StackOverflow
completions.so = {
  alias:  "so",
  name:   "stackoverflow",
  search: "https://stackoverflow.com/search?q=",
  compl:  "https://api.stackexchange.com/2.2/search/advanced?pagesize=10&order=desc&sort=relevance&site=stackoverflow&q=",
}

completions.so.callback = (response) => {
  const res = JSON.parse(response.text).items
  Omnibar.listResults(res, s => Omnibar.createURLItem({
    title: `[${s.score}] ${s.title}`,
    url:   s.link,
  }))
}

// DockerHub repo search
completions.dh = {
  alias:  "dh",
  name:   "dockerhub",
  search: "https://hub.docker.com/search/?page=1&q=",
  compl:  "https://hub.docker.com/v2/search/repositories/?page_size=20&query=",
}

completions.dh.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res.results, (s) => {
    let meta = ""
    let repo = escape(s.repo_name)
    meta += `[★${escape(s.star_count)}] `
    meta += `[↓${escape(s.pull_count)}] `
    if (repo.indexOf("/") === -1) {
      repo = `_/${repo}`
    }
    const li = $("<li/>").html(`
      <div>
        <div class="title"><strong>${escape(s.repo_name)}</strong></div>
        <div>${meta}</div>
        <div>${escape(s.short_description)}</div>
      </div>
    `)
    li.data("url", `https://hub.docker.com/r/${repo}`)
    return li
  })
}

// GitHub
completions.gh = {
  alias:  "gh",
  name:   "github",
  search: "https://github.com/search?q=",
  compl:  "https://api.github.com/search/repositories?sort=stars&order=desc&q=",
}

completions.gh.callback = (response) => {
  const res = JSON.parse(response.text).items
  Omnibar.listResults(res, (s) => {
    let prefix = ""
    if (s.stargazers_count) {
      prefix += `[★${s.stargazers_count}] `
    }
    return Omnibar.createURLItem({
      title: prefix + s.full_name,
      url:   s.html_url,
    })
  })
}

// Domainr domain search
completions.do = {
  alias:  "do",
  name:   "domainr",
  search: "https://domainr.com/?q=",
  compl:  `https://domainr.p.mashape.com/v2/search?mashape-key=${keys.domainr}&query=%s`,
}

completions.do.callback = (response) => {
  const res = JSON.parse(response.text).results
  const domains = []
  res.forEach((r) => {
    const d = {
      id:     escape(r.domain).replace(".", "-"),
      domain: escape(r.domain),
    }
    domains.push(d)
  })

  const domainQuery = domains.map(d => d.domain).join(",")

  runtime.command({
    action: "request",
    method: "get",
    url:    `https://domainr.p.mashape.com/v2/status?mashape-key=${keys.domainr}&domain=${domainQuery}`,
  }, (sresponse) => {
    const sres = JSON.parse(sresponse.text).status
    sres.forEach((s) => {
      const id = `#sk-domain-${escape(s.domain).replace(".", "-")}`
      const available = s.summary === "inactive"
      const color = available ? "#23b000" : "#ff4d00"
      const symbol = available ? "✔ " : "✘ "
      $(id).text(symbol + $(id).text()).css("color", color)
    })
  })

  Omnibar.listResults(domains, (d) => {
    const li = $("<li/>").html(`
      <div id="sk-domain-${d.id}">
        <div class="title"><strong>${d.domain}</strong></div>
      </div>
    `)
    li.data("url", `https://domainr.com/${d.domain}`)
    return li
  })
}

// Vim Wiki
completions.vw = {
  alias:  "vw",
  name:   "vimwikia",
  search: "https://vim.wikia.com/wiki/Special:Search?query=",
  compl:  "https://vim.wikia.com/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.vw.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

// ****** Shopping & Food ****** //

// Amazon
completions.az = {
  alias:  "az",
  name:   "amazon",
  search: "https://smile.amazon.com/s/?field-keywords=",
  compl:  "https://completion.amazon.com/search/complete?method=completion&mkt=1&search-alias=aps&q=",
}

completions.az.callback = (response) => {
  const res = JSON.parse(response.text)[1]
  Omnibar.listWords(res)
}

// Craigslist
completions.cl = {
  alias:  "cl",
  name:   "craigslist",
  search: "https://craigslist.org/search/sss?query=",
  compl:  "https://craigslist.org/suggest?v=12&type=search&cat=sss&area=1&term=",
}

completions.cl.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text))
}

// Yelp
completions.yp = {
  alias:  "yp",
  name:   "yelp",
  search: "https://www.yelp.com/search?find_desc=",
  compl:  "https://www.yelp.com/search_suggest/v2/prefetch?prefix=",
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
  Omnibar.listWords(words)
}

// ****** General References, Calculators & Utilities ****** //

// Dictionary
completions.de = {
  alias:  "de",
  name:   "define",
  search: "http://onelook.com/?w=",
  compl:  "https://api.datamuse.com/words?md=d&sp=%s*",
}

completions.de.callback = (response) => {
  const res = JSON.parse(response.text)
  const defs = []
  res.forEach((r) => {
    if (!r.defs || r.defs.length === 0) {
      defs.push([r.word, "", ""])
      return
    }
    r.defs.forEach((d) => {
      const ds = d.split("\t")
      const sp = `(${ds[0]})`
      const def = ds[1]

      defs.push([r.word, sp, def])
    })
  })
  Omnibar.listResults(defs, (d) => {
    const word = escape(d[0])
    const pos = escape(d[1])
    const def = escape(d[2])
    const li = $("<li/>").html(`<div class="title"><strong>${word}</strong> <em>${pos}</em> ${def}</div>`)
    li.data("url", `http://onelook.com/?w=${encodeURIComponent(d[0])}`)
    return li
  })
}

// Thesaurus
completions.th = {
  alias:  "th",
  name:   "thesaurus",
  search: "https://www.onelook.com/reverse-dictionary.shtml?s=",
  compl:  "https://api.datamuse.com/words?md=d&ml=%s",
}

completions.th.callback = (response) => {
  const res = JSON.parse(response.text)
  const defs = []
  res.forEach((r) => {
    if (!r.defs || r.defs.length === 0) {
      defs.push([escape(r.word), "", ""])
      return
    }
    r.defs.forEach((d) => {
      const ds = d.split("\t")
      const sp = `(${escape(ds[0])})`
      const def = escape(ds[1])
      defs.push([escape(r.word), sp, def])
    })
  })
  Omnibar.listResults(defs, (d) => {
    const li = $("<li/>").html(`<div class="title"><strong>${d[0]}</strong> <em>${d[1]}</em> ${d[2]}</div>`)
    li.data("url", `http://onelook.com/?w=${d[0]}`)
    return li
  })
}

// Wikipedia
completions.wp = {
  alias:  "wp",
  name:   "wikipedia",
  search: "https://en.wikipedia.org/w/index.php?search=",
  compl:  "https://en.wikipedia.org/w/api.php?action=query&format=json&list=prefixsearch&utf8&pssearch=",
}

completions.wp.callback = (response) => {
  const res = JSON.parse(response.text).query.prefixsearch
    .map(r => r.title)
  Omnibar.listWords(res)
}


// WolframAlpha
completions.wa = {
  alias:  "wa",
  name:   "wolframalpha",
  search: "http://www.wolframalpha.com/input/?i=",
  compl:  `http://api.wolframalpha.com/v2/query?appid=${keys.wolframalpha}&format=plaintext&output=json&reinterpret=true&input=%s`,
}

completions.wa.callback = (response) => {
  const res = JSON.parse(response.text).queryresult

  if (res.error) {
    Omnibar.listResults([""], () => {
      const li = $("<li/>").html(`
          <div>
              <div class="title"><strong>Error</strong> (Code ${escape(res.error.code)})</div>
              <div class="title">${escape(res.error.msg)}</div>
          </div>
        `)
      return li
    })
    return
  }

  if (!res.success) {
    if (res.tips) {
      Omnibar.listResults([""], () => {
        const li = $("<li/>").html(`
              <div>
                  <div class="title"><strong>No Results</strong></div>
                  <div class="title">${escape(res.tips.text)}</div>
              </div>
            `)
        return li
      })
    }
    if (res.didyoumeans) {
      Omnibar.listResults(res.didyoumeans, (s) => {
        const li = $("<li/>").html(`
              <div>
                  <div class="title"><strong>Did you mean...?</strong></div>
                  <div class="title">${escape(s.val)}</div>
              </div>
            `)
        return li
      })
    }
    return
  }

  const results = []
  res.pods.forEach((p) => {
    const result = {
      title:  escape(p.title),
      values: [],
      url:    "http://www.wolframalpha.com/input/?i=",
    }
    if (p.numsubpods > 0) {
      result.url += encodeURIComponent(p.subpods[0].plaintext)
      p.subpods.forEach((sp) => {
        if (!sp.plaintext) return
        let v = ""
        if (sp.title) {
          v += `<strong>${escape(sp.title)}</strong>: `
        }
        v += escape(sp.plaintext)
        result.values.push(`<div class="title">${v}</div>`)
      })
    }
    if (result.values.length > 0) {
      results.push(result)
    }
  })

  Omnibar.listResults(results, (r) => {
    const li = $("<li/>").html(`
      <div>
          <div class="title"><strong>${r.title}</strong></div>
          ${r.values.join("\n")}
      </div>
    `)
    li.data("url", r.url)
    return li
  })
}

// ****** Business Utilities & References ****** //

// Crunchbase Organization Search
completions.co = {
  alias:  "co",
  name:   "crunchbase-orgs",
  search: "https://www.crunchbase.com/app/search/?q=",
  compl:  `https://api.crunchbase.com/v/3/odm_organizations?user_key=${keys.crunchbase}&query=%s`,
}

completions.co.callback = (response) => {
  const res = JSON.parse(response.text).data.items
  const orgs = []
  res.forEach((rr) => {
    const r = rr.properties
    const p = {
      name:   escape(r.name),
      domain: escape(r.domain),
      desc:   escape(r.short_description),
      role:   escape(r.primary_role),
      img:    blank,
      loc:    "",
      url:    `https://www.crunchbase.com/${r.web_path}`,
    }

    p.loc += (r.city_name !== null) ? escape(r.city_name) : ""
    p.loc += (r.region_name !== null && p.loc !== "") ? ", " : ""
    p.loc += (r.region_name !== null) ? escape(r.region_name) : ""
    p.loc += (r.country_code !== null && p.loc !== "") ? ", " : ""
    p.loc += (r.country_code !== null) ? escape(r.country_code) : ""
    p.loc += (p.loc === "") ? "Earth" : ""

    if (r.profile_image_url !== null) {
      const url = encodeURIComponent(r.profile_image_url)
      const path = url.split("/")
      const img = path[path.length - 1]
      p.img = `http://public.crunchbase.com/t_api_images/v1402944794/c_pad,h_50,w_50/${img}`
    }

    orgs.push(p)
  })

  Omnibar.listResults(orgs, (p) => {
    const li = $("<li/>").html(`
      <div style="width:100%;height:6em;display:block;">
        <div style="float:left;">
          <img style="width:4em;height:4em;max-width:4em;max-height:4em;overflow:hidden;" src="${p.img}" alt="${p.name}">
        </div>
        <div style="float:left;height:100%;margin-left:10px;">
          <div class="title"><strong>${p.name}</strong></div>
          <div class="title">Type: <em>${p.role}</em>, Domain: <em>${p.domain}</em></div>
          <div class="title">${p.desc}</div>
          <div class="title"><em>${p.loc}</em></div>
        </div>
      </div>
    `)
    li.data("url", p.url)
    return li
  })
}

// Crunchbase People Search
completions.cp = {
  alias:  "cp",
  name:   "crunchbase-people",
  search: "https://www.crunchbase.com/app/search/?q=",
  compl:  `https://api.crunchbase.com/v/3/odm_people?user_key=${keys.crunchbase}&query=%s`,
}

completions.cp.callback = (response) => {
  const res = JSON.parse(response.text).data.items
  const people = []
  res.forEach((rr) => {
    const r = rr.properties
    const p = {
      name: `${escape(r.first_name)} ${escape(r.last_name)}`,
      desc: "",
      img:  blank,
      loc:  "",
      url:  `https://www.crunchbase.com/${r.web_path}`,
    }

    p.desc += (r.title !== null) ? escape(r.title) : ""
    p.desc += (r.organization_name !== null && p.desc !== "") ? ", " : ""
    p.desc += (r.organization_name !== null) ? escape(r.organization_name) : ""
    p.desc += (p.desc === "") ? "Human" : ""

    p.loc += (r.city_name !== null) ? escape(r.city_name) : ""
    p.loc += (r.region_name !== null && p.loc !== "") ? ", " : ""
    p.loc += (r.region_name !== null) ? escape(r.region_name) : ""
    p.loc += (r.country_code !== null && p.loc !== "") ? ", " : ""
    p.loc += (r.country_code !== null) ? escape(r.country_code) : ""
    p.loc += (p.loc === "") ? "Earth" : ""

    if (r.profile_image_url !== null) {
      const url = r.profile_image_url
      const path = url.split("/")
      const img = encodeURIComponent(path[path.length - 1])
      p.img = `http://public.crunchbase.com/t_api_images/v1402944794/c_pad,h_50,w_50/${img}`
    }

    people.push(p)
  })

  Omnibar.listResults(people, (p) => {
    const li = $("<li/>").html(`
      <div style="width:100%;height:6em;display:block;">
        <div style="float:left;">
          <img style="width:4em;height:4em;max-width:4em;max-height:4em;overflow:hidden;" src="${p.img}" alt="${p.name}">
        </div>
        <div style="float:left;height:100%;margin-left:10px;">
          <div class="title"><strong>${p.name}</strong></div>
          <div class="title">${p.desc}</div>
          <div class="title"><em>${p.loc}</em></div>
        </div>
      </div>
    `)
    li.data("url", p.url)
    return li
  })
}

// ****** Search Engines ****** //

// DuckDuckGo
completions.dg = {
  alias:  "dg",
  name:   "duckduckgo",
  search: "https://duckduckgo.com/?q=",
  compl:  "https://duckduckgo.com/ac/?q=",
}

completions.dg.callback = (response) => {
  const res = JSON.parse(response.text).map(r => r.phrase)
  Omnibar.listWords(res)
}

// Google
completions.go = {
  alias:  "go",
  name:   "google",
  search: "https://www.google.com/search?q=",
  compl:  "https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&q=",
}

completions.go.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

// Google Images
completions.gi = {
  alias:  "gi",
  name:   "google-images",
  search: "https://www.google.com/search?tbm=isch&q=",
  compl:  "https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&ds=i&q=",
}

completions.gi.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

// Google - I'm Feeling Lucky
completions.gl = {
  alias:  "gl",
  name:   "google-lucky",
  search: "https://www.google.com/search?btnI=1&q=",
  compl:  "https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&q=",
}

completions.gl.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

//  ****** Elixir ****** //

// Hex.pm
completions.hx = {
  alias:  "hx",
  name:   "hex",
  search: "https://hex.pm/packages?sort=downloads&search=",
  compl:  "https://hex.pm/api/packages?sort=downloads&search=",
}

completions.hx.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res, (s) => {
    let dls = ""
    let desc = ""
    let liscs = ""
    if (s.downloads && s.downloads.all) {
      dls = `[↓${escape(s.downloads.all)}] `
    }
    if (s.meta) {
      if (s.meta.description) {
        desc = escape(s.meta.description)
      }
      if (s.meta.licenses) {
        s.meta.licenses.forEach((l) => {
          liscs += `[&copy;${escape(l)}] `
        })
      }
    }
    const li = $("<li/>").html(`
      <div>
        <div class="title">${escape(s.repository)}/<strong>${escape(s.name)}</strong></div>
        <div>${dls}${liscs}</div>
        <div>${desc}</div>
      </div>
    `)
    li.data("url", s.html_url)
    return li
  })
}

// hexdocs
// Same as hex but links to documentation pages
completions.hd = {
  alias:  "hd",
  name:   "hexdocs",
  search: "https://hex.pm/packages?sort=downloads&search=",
  compl:  "https://hex.pm/api/packages?sort=downloads&search=",
}

completions.hd.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res, (s) => {
    let dls = ""
    let desc = ""
    let liscs = ""
    if (s.downloads && s.downloads.all) {
      dls = `[↓${escape(s.downloads.all)}]`
    }
    if (s.meta) {
      if (s.meta.description) {
        desc = escape(s.meta.description)
      }
      if (s.meta.licenses) {
        s.meta.licenses.forEach((l) => {
          liscs += `[&copy;${escape(l)}] `
        })
      }
    }
    const li = $("<li/>").html(`
      <div>
        <div class="title">${escape(s.repository)}/<strong>${escape(s.name)}</strong></div>
        <div>${dls}${liscs}</div>
        <div>${desc}</div>
      </div>
    `)
    li.data("url", `https://hexdocs.pm/${encodeURIComponent(s.name)}`)
    return li
  })
}

// Exdocs
// Similar to `hd` but searches inside docs using Google Custom Search
completions.ex = {
  alias:  "ex",
  name:   "exdocs",
  search: "https://hex.pm/packages?sort=downloads&search=",
  compl:  googleCxURL("ex"),
}

completions.ex.callback = (response) => {
  const res = JSON.parse(response.text).items
  Omnibar.listResults(res, (s) => {
    let hash = ""

    const snippet = s.htmlSnippet
    const openTag = "<b>"
    const closeTag = "</b>"
    const openArgs = "("
    const closeArgs = ")"

    let f1 = snippet.indexOf(openTag)
    if (f1 === -1) {
      return
    }
    const f2 = snippet.indexOf(closeTag)
    if (f2 === -1) {
      return
    }

    f1 += openTag.length
    const f3 = f2 + closeTag.length
    const fname = snippet.slice(f1, f2)
    const snippetEnd = snippet.slice(f3)

    const a1 = snippetEnd.indexOf(openArgs)
    if (a1 !== 0) {
      return
    }
    let a2 = snippetEnd.indexOf(closeArgs)
    if (a2 === -1) {
      return
    }

    a2 += closeArgs.length
    const fargs = snippetEnd.slice(a1, a2)
    const fary = fargs.replace(new RegExp(openArgs + closeArgs), "").split(",").length
    hash = escape(`${fname}/${fary}`)

    const moduleName = escape(s.title).split(" –")[0]

    let subtitle = ""
    if (hash) {
      subtitle = `
        <div style="font-size:1.1em; line-height:1.25em">
          <em>${moduleName}</em>.<strong>${hash}</strong>
        </div>`
    }
    const li = $("<li/>").html(`
      <div>
        <div class="title"><strong>${s.htmlTitle}</strong></div>
        ${subtitle}
        <div>${s.htmlSnippet}</div>
      </div>
    `)
    li.data("url", `${s.link}#${hash}`)
    return li // eslint-disable-line consistent-return
  })
}

// ****** Golang ****** //

// Godoc
completions.gd = {
  alias:  "gd",
  name:   "godoc",
  search: "https://godoc.org/?q=",
  compl:  "https://api.godoc.org/search?q=",
}

completions.gd.callback = (response) => {
  const res = JSON.parse(response.text).results
  Omnibar.listResults(res, (s) => {
    let prefix = ""
    if (s.import_count) {
      prefix += `[↓${s.import_count}] `
    }
    if (s.stars) {
      prefix += `[★${s.stars}] `
    }
    return Omnibar.createURLItem({
      title: prefix + s.path,
      url:   `https://godoc.org/${s.path}`,
    })
  })
}

// Gowalker
completions.gw = {
  alias:  "gw",
  name:   "gowalker",
  search: "https://gowalker.org/search?auto_redirect=true&q=",
  compl:  "https://gowalker.org/search/json?q=",
}

completions.gw.callback = (response) => {
  const res = JSON.parse(response.text).results
  Omnibar.listResults(res, (s) => {
    const title = escape(s.title)
    const desc = escape(s.description)
    const li = $("<li/>").html(`
      <div>
        <div class="title"><strong>${title}</strong></div>
        <div>${desc}</div>
      </div>
    `)
    li.data("url", `https://golang.org/doc/${encodeURIComponent(s.url)}`)
    return li
  })
}


// Go-Search
completions.gs = {
  alias:  "gs",
  name:   "go-search",
  search: "http://go-search.org/search?q=",
  compl:  "http://go-search.org/api?action=search&q=",
}

completions.gs.callback = (response) => {
  const res = JSON.parse(response.text).hits
    .map(r => r.package)
  Omnibar.listWords(res)
}

// ****** Haskell ****** //

// Hackage
completions.ha = {
  alias:  "ha",
  name:   "hackage",
  search: "https://hackage.haskell.org/packages/search?terms=",
  compl:  "https://hackage.haskell.org/packages/search.json?terms=",
}

completions.ha.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res, s => Omnibar.createURLItem({
    title: s.name,
    url:   `https://hackage.haskell.org/package/${s.name}`,
  }))
}

// Hoogle
completions.ho = {
  alias:  "ho",
  name:   "hoogle",
  search: `https://www.haskell.org/hoogle/?hoogle=${
    encodeURIComponent("+platform +xmonad +xmonad-contrib ")}`, // This tells Hoogle to include these modules in the search - encodeURIComponent is only used for better readability
  compl:  `https://www.haskell.org/hoogle/?mode=json&hoogle=${
    encodeURIComponent("+platform +xmonad +xmonad-contrib ")}`,
}

completions.ho.callback = (response) => {
  const res = JSON.parse(response.text).results
  Omnibar.listResults(res, s => Omnibar.createURLItem({
    title: s.self,
    url:   s.location,
  }))
}

// Haskell Wiki
completions.hw = {
  alias:  "hw",
  name:   "haskellwiki",
  search: "https://wiki.haskell.org/index.php?go=go&search=",
  compl:  "https://wiki.haskell.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search=",
}

completions.hw.callback = (response) => {
  Omnibar.listWords(JSON.parse(response.text)[1])
}

// Hayoo
completions.hy = {
  alias:  "hy",
  name:   "hayoo",
  search: "http://hayoo.fh-wedel.de/?query=",
  compl:  "http://hayoo.fh-wedel.de/json?query=",
}

completions.hy.callback = (response) => {
  const res = JSON.parse(response.text).result
  Omnibar.listResults(res, s => Omnibar.createURLItem({
    title: `[${s.resultType}] ${s.resultName}`,
    url:   s.resultUri,
  }))
}

// ****** HTML, CSS, JavaScript, NodeJS, ... ****** //

// jQuery API documentation
completions.jq = {
  alias:    "jq",
  name:     "jquery",
  search:   googleCxPublicURL("jq"),
  compl:    googleCxURL("jq"),
  callback: googleCxCallback,
}

// NodeJS standard library documentation
completions.no = {
  alias:    "no",
  name:     "node",
  search:   googleCxPublicURL("no"),
  compl:    googleCxURL("no"),
  callback: googleCxCallback,
}

// Mozilla Developer Network (MDN)
completions.md = {
  alias:  "md",
  name:   "mdn",
  search: "https://developer.mozilla.org/en-US/search?q=",
  compl:  "https://developer.mozilla.org/en-US/search.json?q=",
}

completions.md.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res.documents, (s) => {
    let excerpt = escape(s.excerpt)
    if (excerpt.length > 240) {
      excerpt = `${excerpt.slice(0, 240)}…`
    }
    res.query.split(" ").forEach((q) => {
      excerpt = excerpt.replace(new RegExp(q, "gi"), "<strong>$&</strong>")
    })
    const title = escape(s.title)
    const slug = escape(s.slug)
    const li = $("<li/>").html(`
      <div>
        <div class="title"><strong>${title}</strong></div>
        <div style="font-size:0.8em"><em>${slug}</em></div>
        <div>${excerpt}</div>
      </div>
    `)
    li.data("url", s.url)
    return li
  })
}

// NPM registry search
completions.np = {
  alias:  "np",
  name:   "npm",
  search: "https://www.npmjs.com/search?q=",
  compl:  "https://api.npms.io/v2/search/suggestions?size=20&q=",
}

completions.np.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res, (s) => {
    let flags = ""
    let desc = ""
    let stars = ""
    let score = ""
    if (s.package.description) {
      desc = escape(s.package.description)
    }
    if (s.score) {
      if (s.score.final) {
        score = Math.round(Number(s.score.final) * 5)
        stars = "★".repeat(score) + "☆".repeat(5 - score)
      }
    }
    if (s.flags) {
      Object.keys(s.flags).forEach((f) => {
        flags += `[<span style='color:#ff4d00'>⚑</span> ${escape(f)}] `
      })
    }
    const li = $("<li/>").html(`
      <div>
        <style>
          .title>em {
            font-weight: bold;
          }
        </style>
        <div class="title">${s.highlight}</div>
        <div>
          <span style="font-size:2em;line-height:0.5em">${stars}</span>
          <span>${flags}</span>
        </div>
        <div>${desc}</div>
      </div>
    `)
    li.data("url", s.package.links.npm)
    return li
  })
}

// ****** Social Media & Entertainment ****** //

// Hacker News (YCombinator)
completions.hn = {
  alias:  "hn",
  name:   "hackernews",
  search: "https://hn.algolia.com/?query=",
  compl:  "https://hn.algolia.com/api/v1/search?tags=(story,comment)&query=",
}

completions.hn.callback = (response) => {
  const res = JSON.parse(response.text)
  Omnibar.listResults(res.hits, (s) => {
    let title = ""
    let prefix = ""
    if (s.points) {
      prefix += `[↑${s.points}] `
    }
    if (s.num_comments) {
      prefix += `[↲${s.num_comments}] `
    }
    switch (s._tags[0]) { // eslint-disable-line no-underscore-dangle
    case "story":
      title = s.title // eslint-disable-line prefer-destructuring
      break
    case "comment":
      title = s.comment_text
      break
    default:
      title = s.objectID
    }
    const re = new RegExp(`(${res.query.split(" ").join("|")})`, "ig")
    title = title.replace(re, "<strong>$&</strong>")
    const li = $("<li/>").html(`
      <div>
        <div class="title">${prefix + title}</div>
        <div class="url">https://news.ycombinator.com/item?id=${s.objectID}</div>
      </div>
    `)
    li.data("url", s.link)
    return li
  })
}

// Reddit
completions.re = {
  alias:  "re",
  name:   "reddit",
  search: "https://www.reddit.com/search?sort=relevance&t=all&q=",
  compl:  "https://api.reddit.com/search?syntax=plain&sort=relevance&limit=20&q=",
}

completions.re.callback = (response) => {
  const res = JSON.parse(response.text).data.children
  Omnibar.listResults(res, (s) => {
    const d = s.data
    return Omnibar.createURLItem({
      title: `[${d.score}] ${d.title}`,
      url:   `https://reddit.com${d.permalink}`,
    })
  })
}

// YouTube
completions.yt = {
  alias:  "yt",
  name:   "youtube",
  search: "https://www.youtube.com/search?q=",
  compl:  `https://www.googleapis.com/youtube/v3/search?maxResults=20&part=snippet&type=video,channel&key=${keys.google_yt}&safeSearch=none&q=`,
}

completions.yt.callback = (response) => {
  const res = JSON.parse(response.text).items
  Omnibar.listResults(res, (s) => {
    switch (s.id.kind) {
    case "youtube#channel":
      return Omnibar.createURLItem({
        title: `${s.snippet.channelTitle}: ${s.snippet.description}`,
        url:   `https://youtube.com/channel/${s.id.channelId}`,
      })
    case "youtube#video":
      return Omnibar.createURLItem({
        title: ` ▶ ${s.snippet.title}`,
        url:   `https://youtu.be/${s.id.videoId}`,
      })
    default:
      return ""
    }
  })
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = completions
}

