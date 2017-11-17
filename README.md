<!--

NOTICE:
This is an automatically generated file - Do not edit it directly.
The source file is README.tmpl.md

-->
### Maddy's SurfingKeys Configuration

This is my personal configuration for the wonderful [SurfingKeys](https://github.com/brookhong/Surfingkeys) Chrome Extension.

#### Table of Contents

  1. [Bundled Search Engine Completions](#bundled-search-engine-completions)
  2. [Installation Instructions](#installation)
  3. [Screenshots](#screenshots)
  4. [License](#license)

#### Bundled Search Engine Completions

There are currently 38 Search Engine auto-completions.

You can access a Search Engine auto-completion by pressing the search leader key, which is `a` by default, followed by the search engine alias.

For example, to open the Wikipedia completion, you would type `awp` while in normal mode.

| Alias | Name | Domain | Screenshots |
| ---- | ------ | ----- | ----- |
| `af` | `archforums` | `Google Custom Search` |  |
| `al` | `archlinux` | `www.archlinux.org` |  |
| `au` | `AUR` | `aur.archlinux.org` |  |
| `aw` | `archwiki` | `wiki.archlinux.org` |  |
| `az` | `amazon` | `smile.amazon.com` |  |
| `cl` | `craigslist` | `craigslist.org` |  |
| `co` | `crunchbase-orgs` | `www.crunchbase.com` |  |
| `cp` | `crunchbase-people` | `www.crunchbase.com` | [\[1\]](#crunchbase-people)  |
| `cs` | `chromestore` | `chrome.google.com` |  |
| `de` | `define` | `onelook.com` | [\[1\]](#define)  |
| `dg` | `duckduckgo` | `duckduckgo.com` |  |
| `dh` | `dockerhub` | `hub.docker.com` | [\[1\]](#dockerhub)  |
| `do` | `domainr` | `domainr.com` | [\[1\]](#domainr)  |
| `ex` | `exdocs` | `hex.pm` |  |
| `gd` | `godoc` | `godoc.org` |  |
| `gh` | `github` | `github.com` | [\[1\]](#github)  |
| `gl` | `google-lucky` | `www.google.com` |  |
| `go` | `google` | `www.google.com` |  |
| `gs` | `go-search` | `go-search.org` |  |
| `ha` | `hackage` | `hackage.haskell.org` |  |
| `hd` | `hexdocs` | `hex.pm` |  |
| `hn` | `hackernews` | `hn.algolia.com` | [\[1\]](#hackernews)  |
| `ho` | `hoogle` | `www.haskell.org` | [\[1\]](#hoogle)  |
| `hw` | `haskellwiki` | `wiki.haskell.org` |  |
| `hx` | `hex` | `hex.pm` |  |
| `hy` | `hayoo` | `hayoo.fh-wedel.de` |  |
| `md` | `mdn` | `developer.mozilla.org` | [\[1\]](#mdn)  |
| `no` | `node` | `Google Custom Search` |  |
| `np` | `npm` | `www.npmjs.com` | [\[1\]](#npm)  |
| `ow` | `owasp` | `www.owasp.org` |  |
| `re` | `reddit` | `www.reddit.com` |  |
| `so` | `stackoverflow` | `stackoverflow.com` |  |
| `th` | `thesaurus` | `www.onelook.com` | [\[1\]](#thesaurus)  |
| `vw` | `vimwikia` | `vim.wikia.com` |  |
| `wa` | `wolframalpha` | `www.wolframalpha.com` | [\[1\]](#wolframalpha) [\[2\]](#wolframalpha-2)  |
| `wp` | `wikipedia` | `en.wikipedia.org` |  |
| `yp` | `yelp` | `www.yelp.com` |  |
| `yt` | `youtube` | `www.youtube.com` | [\[1\]](#youtube)  |


#### Installation

##### Dependencies

  - `git`
  - `node`
  - `gulp`. 

##### 1. Clone

```shell
$ git clone http://github.com/b0o/surfingkeys-conf
$ cd surfingkeys-conf
```

##### 2. NPM Install

```shell
$ npm install
```

##### 3. Private API Key Configuration

Copy the example private configuration:

```shell
$ cp ./conf.priv.example.js ./conf.priv.js
```

Open `./conf.priv.js` in your favorite editor and follow the instructions inside:

```shell
$ vim ./conf.priv.js
```

##### 4. Gulp Build/Install

```shell
$ gulp install
```

This will build the final configuration file and place it in `~/.surfingkeys`.
If you already have a file in that location, make sure you back it up first!

##### 5. Load your configuration in the SurfingKeys Extension

The final step is to tell SurfingKeys where to find your configuration file:

  - __I.__ Visit [`chrome://extensions/`](chrome://extensions/) and enable `Allow access to file URLs` for the Surfingkeys extension

  - __II.__ Open the SurfingKeys [configuration page](chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html)

  - __III.__ Set the `Load settings from` option to the correct path (substituting `$USER` for your username):
    - __Linux, MacOS, Unix__: `file:///home/$USER/.surfingkeys`
    - __Windows__: `file://%Homedrive%%Homepath%/.surfingkeys` (This is a guess, please correct me if I'm wrong.)

##### 6. Hack Away!

If you ever make a change to any of your configuration files in the future, simply run `gulp install` again and your settings will be immediately updated.

#### Screenshots
##### crunchbase-people
![crunchbase-people screenshot](./assets/screenshots/cp.png)

##### define
![define screenshot](./assets/screenshots/de.png)

##### dockerhub
![dockerhub screenshot](./assets/screenshots/dh.png)

##### domainr
![domainr screenshot](./assets/screenshots/do.png)

##### github
![github screenshot](./assets/screenshots/gh.png)

##### hackernews
![hackernews screenshot](./assets/screenshots/hn.png)

##### hoogle
![hoogle screenshot](./assets/screenshots/ho.png)

##### mdn
![mdn screenshot](./assets/screenshots/md.png)

##### npm
![npm screenshot](./assets/screenshots/np.png)

##### thesaurus
![thesaurus screenshot](./assets/screenshots/th.png)

##### wolframalpha
![wolframalpha screenshot](./assets/screenshots/wa-01.png)

##### wolframalpha 2
![wolframalpha screenshot](./assets/screenshots/wa-02.png)

##### youtube
![youtube screenshot](./assets/screenshots/yt.png)



### License
&copy;2017 Maddison Hellstrom - MIT License
