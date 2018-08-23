<!--{{DISCLAIMER}}-->
Maddy's SurfingKeys Configuration
=================================

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- TODO: Determine minimum SK version -->
<!-- #### Note: This configuration currently only supports SurfingKeys 0.9.14 and below. -->

This is my personal configuration for the wonderful [SurfingKeys](https://github.com/brookhong/Surfingkeys) browser extension.

Its primary features include [keybindings for performing common actions](#site-specific-key-mappings) on many popular
sites, as well OmniBar support for [auto-completing searches](#bundled-search-engine-completions) within <!--{{COMPL_COUNT}}--> sites (and growing)!

Table of Contents
-----------------

1. [Bundled Search Engine Completions](#bundled-search-engine-completions)
2. [Site-Specific Key Mappings](#site-specific-key-mappings)
3. [Installation Instructions](#installation)
4. [Screenshots](#screenshots)
5. [Todo](#todo)
6. [License](#license)

Features
--------

### Site-Specific Key Mappings

Key mappings have been included which can help you perform some common actions
on many popular sites.

Some examples of these mappings are:
- Star the current GitHub/GitLab repository: `<site-leader>s`
- Follow a user on Twitter: `<site-leader>f`
- Upvote a post/comment on Reddit/HackerNews `<site-leader>s`
- Analyze the current Amazon Product using Fakespot `<site-leader>fs`

The mappings are activated by typing the `<site-leader>` (`<space>` by default),
followed by the key sequence.

See [conf.js](./conf.js) for all of the mappings.

<!--TODO: Autogenerate list of site mappings-->

### Bundled Search Engine Completions

There are currently <!--{{COMPL_COUNT}}--> Search Engine auto-completions.

You can access a Search Engine auto-completion by pressing the search leader key, which is `a` by default, followed by the search engine alias.

For example, to open the Wikipedia completion, you would type `awp` while in normal mode.

| Alias | Name | Domain | Screenshots |
| ---- | ------ | ----- | ----- |
<!--{{COMPL_TABLE}}-->

Installation
------------

### Dependencies

Building `surfingkeys-conf` requires a few dependencies to be installed:

- `git`
- `node`
- `gulp`

### Building & Installing

1. __Clone this repository__
	```shell
	$ git clone http://github.com/b0o/surfingkeys-conf
	$ cd surfingkeys-conf
	```

2. __Install the NodeJS build dependencies__
	```shell
	$ npm install
	```

3. __*(Optional)* Private API Key Configuration__

	Some Search Engine Auto-Completions require private API keys for access. These
	keys are defined in `conf.priv.js`, which is not itself included in this repository.
	An example configuration containing instructions on how to generate each API key
	can be found in [conf.priv.example.js](./conf.priv.example.js).

	Copy the example private configuration:

	```shell
	$ cp ./conf.priv.example.js ./conf.priv.js
	```

	Open `./conf.priv.js` in your favorite editor and follow the instructions inside:

	```shell
	$ vim ./conf.priv.js
	```

4. __Gulp Build/Install__
	```shell
	$ gulp install # OR "gulp build" to build to ./build/.surfingkeys without installing
	```

	This will build the final configuration file and place it at `~/.surfingkeys`.
	If you already have a file in that location, make sure you back it up first!

5. __Load your configuration into the SurfingKeys Extension__

	<details>
	<summary><strong>Option A</strong> <em>(recommended)</em>: Configure SurfingKeys to automatically load configuration file from disk</summary>
	- __I.__ Visit [`chrome://extensions/`](chrome://extensions/) and enable `Allow access to file URLs` for the Surfingkeys extension
	- __II.__ Open the SurfingKeys [configuration page](chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html)
	- __III.__ Set the `Load settings from` option to point to the configuration file.

		_Note: you must specify the full, absolute path; environment variables like `$HOME` or the tilde `~` won't work_:

		- __Linux__: `file:///home/{USERNAME}/.surfingkeys` (replace `{USERNAME}` with your username) 
		- __macOS__: `file:///Users/{USERNAME}/.surfingkeys` (replace `{USERNAME}` with your username) 
		- __Windows__: `file://%Homedrive%%Homepath%/.surfingkeys` (This is a guess, please correct me if I'm wrong)
	- __IV.__ Hack Away! If you ever make a change to any of your configuration files in the future, simply run `gulp install` again and your new configuration will automatically be loaded by SurfingKeys.
	</details>

	<details>
	<summary><strong>Option B</strong>: Manually copy/paste into the SurfingKeys configuration form</summary>
	- __I.__ Copy the contents of `./build/.surfingkeys` (or `$HOME/.surfingkeys` if you ran `gulp install`)
	- __II.__ Open the SurfingKeys [configuration page](chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html)
	- __III.__ Paste into the text box, then press `save`
	- __IV.__ Repeat steps 4 & 5 after any changes you make to any of your configuration files.
	</details>

Screenshots
-----------
<!--{{SCREENSHOTS}}-->

Todo
----

- [ ] Add `CHANGELOG.md` using [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [ ] Improve code organization
- [ ] Ensure screenshots have a plain white background
- [ ] Add additional screenshots
- [x] Simplify installation process
- [x] Feed the kittens

License
-------
&copy;2017-2018 Maddison Hellstrom - MIT License
