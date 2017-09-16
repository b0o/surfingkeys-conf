// Unmap undesired defaults
var unmaps = [ "sb" ,  "sw", "ob"
             , "ow" ,  "cp", ";cp"
             , ";ap", "spa", "spb"
             , "spd", "sps", "spc"
             , "spi", "sfr", "zQ"
             , "zz" ,  "zR", "ab"
             , "Q"  ,   "q", "ag"
             , "af" ,  ";s"
             ];

unmaps.forEach(function(u) {
  unmap(u);
});

var rmSearchAliases =
  { "s" : [ "g", "d", "b"
          , "w", "s", "h" ]
  };

Object.keys(rmSearchAliases).forEach(function(k) {
  rmSearchAliases[k].forEach(function(v) {
    removeSearchAliasX(v, k);
  });
});

// Settings
settings.hintAlign = "left";
settings.omnibarSuggestionTimeout = 500;
settings.hintGroups = true;
settings.hintGroupStart = "middle";

// Maps
// Left-hand aliases
// Movement
map('w', 'k');
map('s', 'j');

// Right-hand aliases
// Tab Navigation
map('J', 'E');
map('K', 'R');

// History
map('H', 'S');
map('L', 'D');

// Mapkeys
mapkey('=w', "Lookup whois information for domain", whois, {
    repeatIgnore: true
});

mapkey('=d', "Lookup dns information for domain", dns, {
    repeatIgnore: true
});

mapkey('=D', "Lookup all information for domain", dnsVerbose, {
    repeatIgnore: true
});

mapkey(';se', '#11Edit Settings', 'tabOpenLink("/pages/options.html")');

mapkey(';pd', 'Toggle PDF viewer from SurfingKeys', function() {
    chrome.storage.local.get("noPdfViewer", function(resp) {
        if(!resp.noPdfViewer) {
            chrome.storage.local.set({"noPdfViewer": 1}, function() {
                Front.showBanner("PDF viewer disabled.");
            });
        } else {
            chrome.storage.local.remove("noPdfViewer", function() {
                Front.showBanner("PDF viewer enabled.");
            });
        }
    })
});
mapkey('\\fs', "Run fakespot for the current page (Amazon, Yelp)", fakeSpot, {
    repeatIgnore: true,
    domain: /(amazon\.com|yelp\.com)/i
});

mapkey('\\F', "Toggle fullscreen (YouTube)", ytFullscreen, {
    repeatIgnore: true,
    domain: /(youtube\.com)/i
});

mapkey('\\F', "Toggle fullscreen (Vimeo)", vimeoFullscreen, {
    repeatIgnore: true,
    domain: /(vimeo\.com)/i
});

mapkey('\\s', "Toggle Star (GitHub)", ghToggleStar, {
    repeatIgnore: true,
    domain: /(github\.com)/i
});

mapkey('\\s', "Toggle Star (GitLab)", glToggleStar, {
    repeatIgnore: true,
    domain: /(gitlab\.com)/i
});

mapkey('\\c', "Collapse comment (Reddit)", function() {
    Hints.create('a.expand', Hints.dispatchMouseClick)
}, {
    domain: /(reddit\.com)/i
});

mapkey('\\c', "Collapse comment (HN)", function() {
    Hints.create('a.togg', Hints.dispatchMouseClick)
}, {
    domain: /(news\.ycombinator\.com)/i
});

mapkey('\\v', "Cast vote (Reddit)", function() {
    Hints.create('div.arrow', Hints.dispatchMouseClick)
}, {
    domain: /(reddit\.com)/i
});

mapkey('\\v', "Cast vote (HN)", function() {
    Hints.create('div.votearrow', Hints.dispatchMouseClick)
}, {
    domain: /(news\.ycombinator\.com)/i
});

mapkey('gi', 'Edit current URL with vim editor', vimEditURL);

// Search & completion
// Search leader
let sl = 'a';

// This is a base64-encoded image used as a placeholder for
// the crunchbase Omnibar results if they don't have an image
let blank = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAAAAAByaaZbAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+EICxEMErRVWUQAAABOdEVYdFJhdyBwcm9maWxlIHR5cGUgZXhpZgAKZXhpZgogICAgICAyMAo0NTc4Njk2NjAwMDA0OTQ5MmEwMDA4MDAwMDAwMDAwMDAwMDAwMDAwCnwMkD0AAAGXSURBVEjH1ZRvc4IwDMb7/T8dbVr/sEPlPJQd3g22GzJdmxVOHaQa8N2WN7wwvyZ5Eh/hngzxTwDr0If/TAK67POxbqxnpgCIx9dkrkEvswYnAFiutFSgtQapS4ejwFYqbXQXBmC+QxawuI/MJb0LiCq0DICNHoZRKQdYLKQZEhATcQmwDYD5GR8DDtfqaYAMActvTiVMaUvqhZPVYhYAK2SBAwGMTHngnc4wVmFPW9L6k1PJxbSCkfvhqolKSQhsWSClizNyxwAWdzIADixQRXRmdWSHthsg+TknaztFMZgC3vh/nG/qo68TLAKrCSrUg1ulp3cH+BpItBp3DZf0lFXVOIDnBdwKkLO4D5Q3QMO6HJ+hUb1NKNWMGJn3jf4ejPKn99CXOtsuyab95obGL/rpdZ7oIJK87iPiumG01drbdggoCZuq/f0XaB8/FbG62Ta5cD97XJwuZUT7ONbZTIK5m94hBuQs8535MsL5xxPw6ZoNj0DiyzhhcyMf9BJ0Jk1uRRpNyb4y0UaM9UI7E8+kt/EHgR/R6042JzmiwgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wOC0xMVQxNzoxMjoxOC0wNDowMLy29LgAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDgtMTFUMTc6MTI6MTgtMDQ6MDDN60wEAAAAAElFTkSuQmCC";

// Search engines
var search = [
    { alias:  'al'
    , name:   'archlinux'
    , search: 'https://www.archlinux.org/packages/?arch=x86_64&q='
    , compl:  ''
    , callback: function() {}
    },
    { alias:  'au'
    , name:   'AUR'
    , search: 'https://aur.archlinux.org/packages/?O=0&SeB=nd&outdated=&SB=v&SO=d&PP=100&do_Search=Go&K='
    , compl:  'https://aur.archlinux.org/rpc?type=suggest&arg='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res, function(s) {
          return Omnibar.createURLItem({
            title: s,
            url:   "https://aur.archlinux.org/packages/" + s
          });
        });
      }
    },
    { alias:  'aw'
    , name:   'archwiki'
    , search: 'https://wiki.archlinux.org/index.php?go=go&search='
    , compl:  'https://wiki.archlinux.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search='
    , callback: function(response) {
        Omnibar.listWords(JSON.parse(response.text)[1]);
      }
    },
    { alias:  'az'
    , name:   'amazon'
    , search: 'https://smile.amazon.com/s/?field-keywords='
    , compl:  'https://completion.amazon.com/search/complete?method=completion&mkt=1&search-alias=aps&q='
    , callback: function(response) {
        var res = JSON.parse(response.text)[1];
        Omnibar.listWords(res);
      }
    },
    { alias:  'cl'
    , name:   'craigslist'
    , search: 'https://craigslist.org/search/sss?query='
    , compl:  'https://craigslist.org/suggest?v=12&type=search&cat=sss&area=1&term='
    , callback: function(response) {
        Omnibar.listWords(JSON.parse(response.text));
      }
    },
    { alias:  'co'
    , name:   'crunchbase-orgs'
    , search: 'https://www.crunchbase.com/app/search/?q='
    , compl:  `https://api.crunchbase.com/v/3/odm_organizations?user_key=${keys.crunchbase}&query=%s`
    , callback: function(response) {
        var res = JSON.parse(response.text)["data"]["items"];
        var orgs = [];
        res.map(function(rr){
          var r = rr.properties;
          var p = {
            name: r["name"],
            domain: r["domain"],
            desc: r["short_description"],
            role: r["primary_role"],
            img: blank,
            loc: "",
            url: "https://www.crunchbase.com/" + r["web_path"]
          };

          p.loc += (r["city_name"] !== null)                    ?    r["city_name"] : "";
          p.loc += (r["region_name"] !== null && p.loc !== "")  ?              ", " : "";
          p.loc += (r["region_name"] !== null)                  ?  r["region_name"] : "";
          p.loc += (r["country_code"] !== null && p.loc !== "") ?              ", " : "";
          p.loc += (r["country_code"] !== null)                 ? r["country_code"] : "";
          p.loc += (p.loc === "")                               ? "Earth"           : "";

          if (r["profile_image_url"] !== null) {
            var url  = r["profile_image_url"]
              , path = url.split('/')
              , img  = path[path.length-1];
            p.img = "http://public.crunchbase.com/t_api_images/v1402944794/c_pad,h_50,w_50/" + img;
          }

          orgs.push(p)
        });

        Omnibar.listResults(orgs, function(p) {
          var li = $('<li/>').html(`
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
          li.data('url', p.url);
          return li;
        });
      }
    },
    { alias:  'cp'
    , name:   'crunchbase-people'
    , search: 'https://www.crunchbase.com/app/search/?q='
    , compl:  `https://api.crunchbase.com/v/3/odm_people?user_key=${keys.crunchbase}&query=%s`
    , callback: function(response) {
        var res = JSON.parse(response.text)["data"]["items"];
        var people = [];
        res.map(function(rr){
          var r = rr.properties;
          var p = {
            name: r["first_name"] + " " + r["last_name"],
            desc: "",
            img: blank,
            loc: "",
            url: "https://www.crunchbase.com/" + r["web_path"]
          };

          p.desc += (r["title"] !== null)                              ? r["title"]             : "";
          p.desc += (r["organization_name"] !== null && p.desc !== "") ?                   ", " : "";
          p.desc += (r["organization_name"] !== null)                  ? r["organization_name"] : "";
          p.desc += (p.desc === "")                                    ? "Human"                : "";

          p.loc += (r["city_name"] !== null)                    ?    r["city_name"] : "";
          p.loc += (r["region_name"] !== null && p.loc !== "")  ?              ", " : "";
          p.loc += (r["region_name"] !== null)                  ?  r["region_name"] : "";
          p.loc += (r["country_code"] !== null && p.loc !== "") ?              ", " : "";
          p.loc += (r["country_code"] !== null)                 ? r["country_code"] : "";
          p.loc += (p.loc === "")                               ? "Earth"           : "";

          if (r["profile_image_url"] !== null) {
            var url  = r["profile_image_url"]
              , path = url.split('/')
              , img  = path[path.length-1];
            p.img = "http://public.crunchbase.com/t_api_images/v1402944794/c_pad,h_50,w_50/" + img;
          }

          people.push(p)
        });

        Omnibar.listResults(people, function(p) {
          var li = $('<li/>').html(`
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
          li.data('url', p.url);
          return li;
        });
      }
    },
    { alias:  'cs'
    , name:   'chromestore'
    , search: 'https://chrome.google.com/webstore/search/'
    , compl:  ''
    , callback: function() {}
    },
    { alias:  'de'
    , name:   'define'
    , search: 'http://onelook.com/?w='
    , compl:  'https://api.datamuse.com/words?md=d&sp=%s*'
    , callback: function(response) {
        var res = JSON.parse(response.text);
        var defs = [];
        res.map(function(r){
            if (!r.defs || r.defs.length === 0) {
              defs.push([r.word, "", ""]);
              return
            }
            r.defs.map(function(d) {
              d = d.split("\t")

              var sp  = "(" + d[0] + ")",
                  def = d[1];

              defs.push([r.word, sp, def]);
            });
        });
        Omnibar.listResults(defs, function(d) {
          var li = $('<li/>').html(`<div class="title"><strong>${d[0]}</strong> <em>${d[1]}</em> ${d[2]}</div>`)
          li.data('url', "http://onelook.com/?w=" + d[0]);
          return li;
        });
      }
    },
    { alias:  'dg'
    , name:   'duckduckgo'
    , search: 'https://duckduckgo.com/?q='
    , compl:  'https://duckduckgo.com/ac/?q='
    , callback: function(response) {
        var res = JSON.parse(response.text).map(function(r){
            return r.phrase;
        });
        Omnibar.listWords(res);
      }
    },
    { alias:  'dh'
    , name:   'dockerhub'
    , search: 'https://hub.docker.com/search/?page=1&q='
    , compl:  'https://hub.docker.com/v2/search/repositories/?page_size=20&query='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res["results"], function(s) {
          var meta = ""
            , repo = s["repo_name"];
          meta += "[★" + s["star_count"] + "] ";
          meta += "[↓" + s["pull_count"] + "] ";
          if (repo.indexOf("/") === -1) {
            repo = "_/" + repo
          }
          var li = $('<li/>').html(`
            <div>
              <div class="title"><strong>${s["repo_name"]}</strong></div>
              <div>${meta}</div>
              <div>${s["short_description"]}</div>
            </div>
          `)
          li.data('url', "https://hub.docker.com/r/" + repo);
          return li;
        });
      }
    },
    { alias:  'do'
    , name:   'domainr'
    , search: 'https://domainr.com/?q='
    , compl:  `https://api.domainr.com/v2/search?client_id=${keys.domainr}&query=%s`
    , callback: function(response) {
        var res = JSON.parse(response.text)["results"];
        var domains = [];
        res.map(function(r){
          var d = {
            id: r["domain"].replace('.', '-'),
            domain: r["domain"]
          };
          domains.push(d);
        });

        var domainQuery = domains.map(function(d) { return d.domain }).join(',')

        runtime.command({
            action: 'request',
            method: 'get',
            url: `https://api.domainr.com/v2/status?client_id=${keys.domainr}&domain=${domainQuery}`
        }, function(sresponse) {
          var sres = JSON.parse(sresponse.text)["status"];
          sres.map(function(s) {
            var id        = "#sk-domain-" + s["domain"].replace('.', '-')
              , available = s["summary"] === "inactive"
              , color     = available ? "#23b000" : "#ff4d00"
              , symbol    = available ? "✔ " : "✘ ";
            $(id).text(symbol + $(id).text()).css("color", color)
          })
        });

        Omnibar.listResults(domains, function(d) {
          var li = $('<li/>').html(`
            <div id="sk-domain-${d.id}">
              <div class="title"><strong>${d.domain}</strong></div>
            </div>
          `)
          li.data('url', `https://domainr.com/${d.domain}`);
          return li;
        });
      }
    },
    { alias:  'ex' // Similar to `hd` but searches inside docs using Google Custom Search
    , name:   'exdocs'
    , search: 'https://hex.pm/packages?sort=downloads&search='
    , compl:  `https://www.googleapis.com/customsearch/v1?key=${keys.google_ex}&cx=${keys.google_ex_cx}&q=`
    , callback: function(response) {
        var res = JSON.parse(response.text)["items"];
        Omnibar.listResults(res, function(s) {
          var snippet   = s["htmlSnippet"];
          var hash = "";

          // Hacky way to extract the desired function's
          // signature to use as an anchor because
          // Google Custom Search doesn't link to the appropriate
          // section of the documentation page
          // A regex would probably work better.
          (function() {
            var openTag   = "<b>"
              , closeTag  = "</b>"
              , openArgs  = "("
              , closeArgs = ")";

            var f1 = snippet.indexOf(openTag);
            if (f1 === -1) {
              return;
            }
            var f2 = snippet.indexOf(closeTag);
            if (f2 === -1) {
              return;
            }

            f1 += openTag.length;
            f3 = f2 + closeTag.length;
            fname = snippet.slice(f1, f2);
            snippetEnd = snippet.slice(f3);

            var a1 = snippetEnd.indexOf(openArgs);
            if (a1 !== 0) {
              return;
            }
            var a2 = snippetEnd.indexOf(closeArgs);
            if (a2 === -1) {
              return;
            }

            a2 += closeArgs.length;
            var fargs = snippetEnd.slice(a1, a2)
            var fary = fargs.replace(new RegExp(openArgs + closeArgs), '').split(',').length;
            hash = fname + '/' + fary;
          })();

          var moduleName = s["title"].split(' –')[0];

          var subtitle = ""
          if (hash) {
            var subtitle = `
              <div style="font-size:1.1em; line-height:1.25em">
                <em>${moduleName}</em>.<strong>${hash}</strong>
              </div>`
          }
          var li = $('<li/>').html(`
            <div>
              <div class="title"><strong>${s["htmlTitle"]}</strong></div>
              ${subtitle}
              <div>${s["htmlSnippet"]}</div>
            </div>
          `)
          li.data('url', s["link"] + "#" + hash);
          return li;
        })
      }
    },
    { alias:  'gd'
    , name:   'godoc'
    , search: 'https://godoc.org/?q='
    , compl:  'https://api.godoc.org/search?q='
    , callback: function(response) {
        var res = JSON.parse(response.text)["results"];
        Omnibar.listResults(res, function(s) {
          var prefix = ""
          if (s["import_count"]) {
            prefix += "[↓" + s["import_count"] + "] "
          }
          if (s["stars"]) {
            prefix += "[★" + s["stars"] + "] "
          }
          return Omnibar.createURLItem({
            title: prefix + s["path"],
            url:   "https://godoc.org/" + s["path"]
          });
        });
      }
    },
    { alias:  'gh'
    , name:   'github'
    , search: 'https://github.com/search?q='
    , compl:  'https://api.github.com/search/repositories?sort=stars&order=desc&q='
    , callback: function(response) {
        var res = JSON.parse(response.text)["items"];
        Omnibar.listResults(res, function(s) {
          var prefix = "";
          if (s["stargazers_count"]) {
            prefix += "[★" + s["stargazers_count"] + "] "
          }
          return Omnibar.createURLItem({
            title: prefix + s["full_name"],
            url:   s["html_url"]
          });
        });
      }
    },
    { alias:  'go'
    , name:   'google'
    , search: 'https://www.google.com/search?q='
    , compl:  'https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&q='
    , callback: function(response) {
        Omnibar.listWords(JSON.parse(response.text)[1]);
      }
    },
    { alias:  'gs'
    , name:   'go-search'
    , search: 'http://go-search.org/search?q='
    , compl:  'http://go-search.org/api?action=search&q='
    , callback: function(response) {
        var res = JSON.parse(response.text)["hits"]
          .map(function(r){
              return r.package;
          });
        Omnibar.listWords(res);
      }
    },
    { alias:  'ha'
    , name:   'hackage'
    , search: 'https://hackage.haskell.org/packages/search?terms='
    , compl:  'https://hackage.haskell.org/packages/search.json?terms='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res, function(s) {
            return Omnibar.createURLItem({
              title: s.name,
              url:   'https://hackage.haskell.org/package/' + s.name
            });
        });
      }
    },
    { alias:  'hd' // Same as hex but links to documentation pages
    , name:   'hexdocs'
    , search: 'https://hex.pm/packages?sort=downloads&search='
    , compl:  'https://hex.pm/api/packages?sort=downloads&search='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res, function(s) {
          var dls = ""
            , desc   = ""
            , liscs  = "";
          if (s["downloads"] && s["downloads"]["all"]) {
            dls = "[↓" + s["downloads"]["all"] + "] ";
          }
          if(s["meta"]) {
            if (s["meta"]["description"]) {
              desc = s["meta"]["description"];
            }
            if (s["meta"]["licenses"]) {
              s["meta"]["licenses"].forEach(function(l) {
                liscs += "[&copy;" + l + "] ";
              })
            }
          }
          var li = $('<li/>').html(`
            <div>
              <div class="title">${s["repository"]}/<strong>${s["name"]}</strong></div>
              <div>${dls}${liscs}</div>
              <div>${desc}</div>
            </div>
          `)
          li.data('url', "https://hexdocs.pm/" + s["name"]);
          return li;
        });
      }
    },
    { alias:  'hn'
    , name:   'hackernews'
    , search: 'https://hn.algolia.com/?query='
    , compl:  'https://hn.algolia.com/api/v1/search?tags=(story,comment)&query='
    , callback: function(response) {
        var res = JSON.parse(response.text)["hits"];
        Omnibar.listResults(res, function(s) {
            var title = "";
            var prefix = "";
            if (s["points"]) {
              prefix += "[↑" + s["points"] + "] ";
            }
            if (s["num_comments"]) {
              prefix += "[↲" + s["num_comments"] + "] ";
            }
            switch(s._tags[0]) {
              case "story":
                title = s["title"];
                break;
              case "comment":
                title = s["comment_text"];
                break;
              default:
                title = s["objectID"];
            }
            return Omnibar.createURLItem({
              title: prefix + title,
              url:   "https://news.ycombinator.com/item?id=" + s["objectID"]
            });
        });
      }
    },
    { alias:  'ho'
    , name:   'hoogle'
    , search: 'https://www.haskell.org/hoogle/?hoogle='
        + encodeURIComponent("+platform +xmonad +xmonad-contrib ") // This tells Hoogle to include these modules in the search - encodeURIComponent is only used for better readability
    , compl:  'https://www.haskell.org/hoogle/?mode=json&hoogle='
        + encodeURIComponent("+platform +xmonad +xmonad-contrib ")
    , callback: function(response) {
        var res = JSON.parse(response.text)["results"];
        Omnibar.listResults(res, function(s) {
            return Omnibar.createURLItem({
              title: s.self,
              url:   s.location
            });
        });
      }
    },
    { alias:  'hw'
    , name:   'haskellwiki'
    , search: 'https://wiki.haskell.org/index.php?go=go&search='
    , compl:  'https://wiki.haskell.org/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=10&suggest=true&search='
    , callback: function(response) {
        Omnibar.listWords(JSON.parse(response.text)[1]);
      }
    },
    { alias:  'hx'
    , name:   'hex'
    , search: 'https://hex.pm/packages?sort=downloads&search='
    , compl:  'https://hex.pm/api/packages?sort=downloads&search='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res, function(s) {
          var dls = ""
            , desc   = ""
            , liscs  = "";
          if (s["downloads"] && s["downloads"]["all"]) {
            dls = "[↓" + s["downloads"]["all"] + "] ";
          }
          if(s["meta"]) {
            if (s["meta"]["description"]) {
              desc = s["meta"]["description"];
            }
            if (s["meta"]["licenses"]) {
              s["meta"]["licenses"].forEach(function(l) {
                liscs += "[&copy;" + l + "] ";
              })
            }
          }
          var li = $('<li/>').html(`
            <div>
              <div class="title">${s["repository"]}/<strong>${s["name"]}</strong></div>
              <div>${dls}${liscs}</div>
              <div>${desc}</div>
            </div>
          `)
          li.data('url', s["html_url"]);
          return li;
        });
      }
    },
    { alias:  'hy'
    , name:   'hayoo'
    , search: 'http://hayoo.fh-wedel.de/?query='
    , compl:  'http://hayoo.fh-wedel.de/json?query='
    , callback: function(response) {
        var res = JSON.parse(response.text)["result"];
        Omnibar.listResults(res, function(s) {
            return Omnibar.createURLItem({
              title: "[" + s.resultType + "] " + s.resultName,
              url:   s.resultUri
            });
        });
      }
    },
    { alias:  'md'
    , name:   'mdn'
    , search: 'https://developer.mozilla.org/en-US/search?q='
    , compl:  'https://developer.mozilla.org/en-US/search.json?q='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res["documents"], function(s) {
          var excerpt = s["excerpt"]
          if(excerpt.length > 240) {
            excerpt = excerpt.slice(0, 240) + '…';
          }
          res["query"].split(" ").forEach(function(q) {
            excerpt = excerpt.replace(new RegExp(q, 'gi'), "<strong>$&</strong>");
          });
          var li = $('<li/>').html(`
            <div>
              <div class="title"><strong>${s["title"]}</strong></div>
              <div style="font-size:0.8em"><em>${s["slug"]}</em></div>
              <div>${excerpt}</div>
            </div>
          `);
          li.data('url', s["url"]);
          return li;
        });
      }
    },
    { alias:  'np'
    , name:   'npm'
    , search: 'https://www.npmjs.com/search?q='
    , compl:  'https://api.npms.io/v2/search/suggestions?size=20&q='
    , callback: function(response) {
        var res = JSON.parse(response.text);
        Omnibar.listResults(res, function(s) {
          var flags = ""
            , desc  = ""
            , stars = "";
          if (s["package"]["description"]) {
            desc = s["package"]["description"];
          }
          if(s["score"]) {
            if (s["score"]["final"]) {
                score = Math.round(s["score"]["final"] * 5);
                stars = "★".repeat(score) + "☆".repeat(5-score);
            }
          }
          if (s["flags"]) {
            Object.keys(s["flags"]).forEach(function(f) {
              flags += "[<span style='color:#ff4d00'>⚑</span> " + f + "] ";
            })
          }
          var li = $('<li/>').html(`
            <div>
              <style>
                .title>em {
                  font-weight: bold;
                }
              </style>
              <div class="title">${s["highlight"]}</div>
              <div>
                <span style="font-size:2em;line-height:0.5em">${stars}</span>
                <span>${flags}</span>
              </div>
              <div>${desc}</div>
            </div>
          `)
          li.data('url', s["package"]["links"]["npm"]);
          return li;
        });
      }
    },
    { alias:  're'
    , name:   'reddit'
    , search: 'https://www.reddit.com/search?sort=relevance&t=all&q='
    , compl:  'https://api.reddit.com/search?syntax=plain&sort=relevance&limit=20&q='
    , callback: function(response) {
        var res = JSON.parse(response.text)["data"]["children"];
        Omnibar.listResults(res, function(s) {
          var d = s["data"];
          return Omnibar.createURLItem({
            title: "[" + d["score"] + "] " + d["title"],
            url:   "https://reddit.com" + d["permalink"]
          });
        });
      }
    },
    { alias:  'so'
    , name:   'stackoverflow'
    , search: 'https://stackoverflow.com/search?q='
    , compl:  'https://api.stackexchange.com/2.2/search/advanced?pagesize=10&order=desc&sort=relevance&site=stackoverflow&q='
    , callback: function(response) {
        var res = JSON.parse(response.text)["items"];
        Omnibar.listResults(res, function(s) {
          return Omnibar.createURLItem({
            title: "[" + s["score"] + "] " + s["title"],
            url:   s["link"]
          });
        });
      }
    },
    { alias:  'wp'
    , name:   'wikipedia'
    , search: 'https://en.wikipedia.org/w/index.php?search='
    , compl:  'https://en.wikipedia.org/w/api.php?action=query&format=json&list=prefixsearch&utf8&pssearch='
    , callback: function(response) {
        var res = JSON.parse(response.text)["query"]["prefixsearch"]
          .map(function(r){
            return r.title;
          });
        Omnibar.listWords(res);
      }
    },
    { alias:  'yp'
    , name:   'yelp'
    , search: 'https://www.yelp.com/search?find_desc='
    , compl:  'https://www.yelp.com/search_suggest/v2/prefetch?prefix='
    , callback: function(response) {
        var res = JSON.parse(response.text)["response"];
        var words = [];
        res.map(function(r){
          r["suggestions"].map(function(s) {
            var w = s["query"];
            if (words.indexOf(w) === -1) {
              words.push(w);
            }
          });
        });
        Omnibar.listWords(words);
      }
    },
    { alias:  'yt'
    , name:   'youtube'
    , search: 'https://www.youtube.com/search?q='
    , compl:  `https://www.googleapis.com/youtube/v3/search?maxResults=20&part=snippet&type=video,channel&key=${keys.google_yt}&safeSearch=none&q=`
    , callback: function(response) {
        var res = JSON.parse(response.text)["items"];
        Omnibar.listResults(res, function(s) {
          switch(s["id"]["kind"]) {
            case "youtube#channel":
              return Omnibar.createURLItem({
                title: s["snippet"]["channelTitle"] + ": " + s["snippet"]["description"],
                url:   "https://youtube.com/channel/" + s["id"]["channelId"]
              });
              break;
            case "youtube#video":
              return Omnibar.createURLItem({
                title: " ▶ " + s["snippet"]["title"],
                url:   "https://youtu.be/" + s["id"]["videoId"]
              });
              break;
          }
        });
      }
    },
];

for(var i = 0; i < search.length; i++) {
    var s  = search[i],    // Search object
        la = sl + s.alias; // Search leader + alias

    addSearchAliasX(s.alias, s.name, s.search, sl, s.compl, s.callback);
    mapkey(la, '#8Search ' + s.name, 'Front.openOmnibar({type: "SearchEngine", extra: "' + s.alias + '"})');
}

// Functions
function fakeSpot() {
    var url = "http://fakespot.com/analyze?url=" + window.location.href;
    window.open(url, '_blank').focus();
}

function ytFullscreen() {
    $('.ytp-fullscreen-button.ytp-button').click();
}

function vimeoFullscreen() {
    $('.fullscreen-icon').click();
}

function ghToggleStar() {
  var repo = window.location.pathname.slice(1).split("/").slice(0,2).join("/");
  var cur = $('div.starring-container > form').filter(function() {
    return $(this).css("display") === "block";
  });

  var action = "starred";
  var star = "★";
  if (cur.attr("class") === "starred") {
    action = "un" + action
    star = "☆"
  }

  cur.find("button").click();
  Front.showBanner(star + " Repository " + repo + " " + action);
}

function glToggleStar() {
  var repo = window.location.pathname.slice(1).split("/").slice(0,2).join("/");
  var action = $('.btn.star-btn > span').click().text().toLowerCase() + "red";
  var star = "☆";
  if (action === "starred") {
    star = "★";
  }
  Front.showBanner(star + " Repository " + repo + " " + action);
}

function vimEditURL() {
    Front.showEditor(window.location.href, function(data) {
        window.location.href = data;
    }, 'url');
}

function whois() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_whois=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function dns() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_dns=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function dnsVerbose() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

// vim: set ft=javascript expandtab:
