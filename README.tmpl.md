<!--{{DISCLAIMER}}-->
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

### Maddy's SurfingKeys Configuration

<!-- TODO: Determine minimum SK version -->
<!-- #### Note: This configuration currently only supports SurfingKeys 0.9.14 and below. -->

This is my personal configuration for the wonderful [SurfingKeys](https://github.com/brookhong/Surfingkeys) browser extension.

#### Table of Contents

  1. [Bundled Search Engine Completions](#bundled-search-engine-completions)
  2. [Installation Instructions](#installation)
  3. [Screenshots](#screenshots)
  4. [License](#license)

#### Bundled Search Engine Completions

There are currently <!--{{COMPL_COUNT}}--> Search Engine auto-completions.

You can access a Search Engine auto-completion by pressing the search leader key, which is `a` by default, followed by the search engine alias.

For example, to open the Wikipedia completion, you would type `awp` while in normal mode.

| Alias | Name | Domain | Screenshots |
| ---- | ------ | ----- | ----- |
<!--{{COMPL_TABLE}}-->

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
$ gulp install # OR "gulp build" to build to ./build/.surfingkeys without installing
```

This will build the final configuration file and place it at `~/.surfingkeys`.
If you already have a file in that location, make sure you back it up first!

##### 5. Load your configuration in the SurfingKeys Extension

###### Option A _(recommended)_: Configure SurfingKeys to automatically load configuration file from disk
  - __I.__ Visit [`chrome://extensions/`](chrome://extensions/) and enable `Allow access to file URLs` for the Surfingkeys extension

  - __II.__ Open the SurfingKeys [configuration page](chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html)

  - __III.__ Set the `Load settings from` option to point to the configuration file.

    _Note: you must specify the full, absolute path; environment variables like `$HOME` or the tilde `~` won't work_:

    - __Linux__: `file:///home/{USERNAME}/.surfingkeys` (replace `{USERNAME}` with your username) 
    - __macOS__: `file:///Users/{USERNAME}/.surfingkeys` (replace `{USERNAME}` with your username) 
    - __Windows__: `file://%Homedrive%%Homepath%/.surfingkeys` (This is a guess, please correct me if I'm wrong)

  - __IV.__ Hack Away! If you ever make a change to any of your configuration files in the future, simply run `gulp install` again and your new configuration will automatically be loaded by SurfingKeys.

###### Option B: Manually copy/paste into the SurfingKeys configuration form
  - __I.__ Copy the contents of `./build/.surfingkeys` (or `$HOME/.surfingkeys` if you ran `gulp install`)
  - __II.__ Open the SurfingKeys [configuration page](chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html)
  - __III.__ Paste into the text box, then press `save`
  - __IV.__ Repeat steps 4 & 5 after any changes you make to any of your configuration files.

#### Screenshots
<!--{{SCREENSHOTS}}-->

#### Todo

- [ ] Add `CHANGELOG.md` using [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [ ] Simplify installation process
- [ ] Improve code organization
- [ ] Ensure screenshots have a plain white background
- [ ] Add additional screenshots
- [x] Feed the kittens

### License
&copy;2017-2018 Maddison Hellstrom - MIT License
