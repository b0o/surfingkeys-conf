### Maddy's SurfingKeys Configuration

This is my personal configuration for the wonderful [SurfingKeys](https://github.com/brookhong/Surfingkeys) Chrome Extension.


It currently includes Search Engine auto-completions for 31 sites,
along with some convenience functions and key remappings.

| Alias | Name | Domain | 
| ---- | ------ | ----- |
| `al` | `archlinux` | `www.archlinux.org` |
| `au` | `AUR` | `aur.archlinux.org` |
| `aw` | `archwiki` | `wiki.archlinux.org` |
| `az` | `amazon` | `smile.amazon.com` |
| `cl` | `craigslist` | `craigslist.org` |
| `co` | `crunchbase-orgs` | `www.crunchbase.com` |
| `cp` | `crunchbase-people` | `www.crunchbase.com` |
| `cs` | `chromestore` | `chrome.google.com` |
| `de` | `define` | `onelook.com` |
| `dg` | `duckduckgo` | `duckduckgo.com` |
| `dh` | `dockerhub` | `hub.docker.com` |
| `do` | `domainr` | `domainr.com` |
| `ex` | `hexdocs` | `hex.pm` |
| `gd` | `godoc` | `godoc.org` |
| `gh` | `github` | `github.com` |
| `go` | `google` | `www.google.com` |
| `gs` | `go-search` | `go-search.org` |
| `ha` | `hackage` | `hackage.haskell.org` |
| `hd` | `hexdocs` | `hex.pm` |
| `hn` | `hackernews` | `hn.algolia.com` |
| `ho` | `hoogle` | `www.haskell.org` |
| `hw` | `haskellwiki` | `wiki.haskell.org` |
| `hx` | `hex` | `hex.pm` |
| `hy` | `hayoo` | `hayoo.fh-wedel.de` |
| `md` | `mdn` | `developer.mozilla.org` |
| `np` | `npm` | `www.npmjs.com` |
| `re` | `reddit` | `www.reddit.com` |
| `so` | `stackoverflow` | `stackoverflow.com` |
| `wp` | `wikipedia` | `en.wikipedia.org` |
| `yp` | `yelp` | `www.yelp.com` |
| `yt` | `youtube` | `www.youtube.com` |

#### Installation

You'll need `git`, `node`, and `gulp`. 

First, clone the repo:

```shell
$ git clone http://github.com/b0o/surfingkeys-conf
$ cd surfingkeys-conf
```

Next, follow the instructions inside [conf.priv.example.js](conf.priv.example.js).
If you don't want to add any API keys, just copy the file as instructed but leave it as-is:

```shell
$ cp ./conf.priv.example.js ./conf.priv.js
```

Next, run `npm install`:

```shell
$ npm install
```

Run `gulp install`. 
This will build the final configuration file and place it in `~/.surfingkeys`.
If you already have a file in that location, make sure you back it up first!

```shell
$ gulp install
```

In order to reference a local file, you need to check __Allow access to file URLs__ in [chrome://extensions/](chrome://extensions/) for the SurfingKeys extension.

Finally, you'll need to open the SurfingKeys [configuration page](chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html) and set the __Load settings from__ option to __"file:///home/YOUR_USERNAME_HERE/.surfingkeys"__. (This is for Unix-like Operating Systems. For Windows, you'll need to figure out the proper path)

If you make a change to __conf.js__ in the future, simply run `gulp install` again.

### License
&copy;2017 Maddison Hellstrom - MIT License
