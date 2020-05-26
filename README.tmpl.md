<!--{{DISCLAIMER}}-->

Maddy's SurfingKeys Configuration
=================================

This is my configuration for the [SurfingKeys](https://github.com/brookhong/Surfingkeys) browser extension.

Its primary features include
- <!--{{KEYS_MAPS_COUNT}}--> [Site-Specific Key Mappings](#site-specific-key-mappings) which **automate common actions** on many popular websites
- <!--{{COMPL_COUNT}}--> [Search Suggestion Engines](#search-suggestion-engines) providing **interactive search suggestions** from dozens of knowledge sources

Table of Contents
-----------------

1. [Site-Specific Key Mappings](#site-specific-key-mappings)
2. [Search Suggestion Engines](#search-suggestion-engines)
3. [Installation Instructions](#installation)
4. [Screenshots](#screenshots)
5. [Todo](#todo)
6. [License](#license)

Features
--------

### Site-Specific Key Mappings

<!--{{KEYS_MAPS_COUNT}}--> key mappings for <!--{{KEYS_SITES_COUNT}}--> unique
sites have been included which can help you perform some common actions:

<table>
<tbody>
<!--{{KEYS_TABLE}}-->
</tbody>
</table>

### Search Suggestion Engines

There are currently <!--{{COMPL_COUNT}}--> search suggestion engines.

You can access a search suggestion prompt by pressing the search leader key, which is `a` by default, followed by the search engine alias.

For example, to open the Wikipedia suggestion engine, you would type `awp` while in normal mode.

<table>
<thead>
<th colspan=2>Alias</th>
<th>Name</th>
<th>Domain</th>
<th>Screenshots</th>
</thead>
<tbody>
<!--{{COMPL_TABLE}}-->
</tbody>
</table>

<!--
| Alias | Name | Domain | Screenshots |
| ----- | ---- | ------ | ----------- |
-->

Installation
------------

### Dependencies

Building `surfingkeys-conf` requires a few dependencies to be installed:

- __Surfingkeys__ `^0.9.40`
- __git__
- __node__
- __gulp__

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

	Some search suggestion engines require private API keys for access. These
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
	$ gulp install # OR "gulp build" to build to ./build/surfingkeys.js without installing
	```

	This will build the final configuration file and place it at `~/.config/surfingkeys.js`.
	If you already have a file in that location, make sure you back it up first!

5. __Load your configuration into the SurfingKeys Extension__

	<details>
	<summary><strong>Option A</strong> <em>(recommended)</em>: Configure SurfingKeys to automatically load the configuration file</summary>
	<blockquote><details>
	<summary><strong>Local File Access (Chrome/Chromium only)</strong></summary>

	- __I.__ Visit `chrome://extensions/` and enable `Allow access to file URLs` for the Surfingkeys extension.

	- __II.__ Open the SurfingKeys configuration page: `chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html`.

	- __III.__ Set the `Load settings from` option to point to the configuration file.

		_Note: you must specify the full, absolute path; environment variables like `$HOME` or the tilde `~` won't work_:

		- __Linux__: `file:///home/{USERNAME}/.config/surfingkeys.js` (replace `{USERNAME}` with your username) 
		- __macOS__: `file:///Users/{USERNAME}/.config/surfingkeys.js` (replace `{USERNAME}` with your username) 
		- __Windows__: `file://%Homedrive%%Homepath%/surfingkeys.js` (This is a guess, please correct me if I'm wrong)

	- __IV.__ Hack Away! If you ever make a change to any of your configuration files in the future, simply run `gulp install` again and your 
		new configuration will automatically be loaded by SurfingKeys.

	</details></blockquote>
	<blockquote><details>
	<summary><strong>Local Web Server (Chrome, Chromium, and Firefox)</strong></summary>

	- __I.__ Run the configuration file server:

		```shell
		$ gulp serve-simple
		```

		Alternatively, you can use the `gulp serve` task, which automatically rebuilds the configuration file whenever a source file is modified.

	- __II.__ Open the SurfingKeys configuration page: 

		Chrome: `chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html`

		Firefox: `moz-extension://7b04efeb-0b36-47f6-9f57-70293e5ee7b2/pages/options.html`

	- __III.__ Set the `Load settings from` option to `http://localhost:9919`

	- __IV.__ You will want to configure your system to automatically run `gulp serve-simple` from the repository directory on boot, otherwise 
		SurfingKeys will lose the settings as soon as the local web server is down.
	
		If you run Linux with systemd, an [example user service](./surfingkeys-conf.service) is provided in this repo. You will need to modify 
		it to contain the proper path to your surfingkeys-conf repo.

	- __V.__ Hack Away! If you ever make a change to any of your configuration files in the future, simply run `gulp build` again and your new 
		configuration will automatically be loaded by SurfingKeys.

	- __Note:__ This method starts a web server on `localhost:9919`. Depending on your firewall configuration, other devices on your local network 
		(or the internet at large in the case of misconfigured router firewall) may be able to read your configuration file, including any private
		API keys or other secrets you have configured in `conf.priv.js`. Proceed with caution.

	</details></blockquote>
	</details>
	<details>
	<summary><strong>Option B</strong>: Manually copy/paste into the SurfingKeys configuration form</summary>

	- __I.__ Copy the contents of `./build/surfingkeys.js` (or `$HOME/.config/surfingkeys.js` if you ran `gulp install`)

	- __II.__ Open the SurfingKeys configuration page: 

		Chrome: `chrome-extension://mffcegbjcdejldmihkogmcnkgbbhioid/pages/options.html`

		Firefox: `moz-extension://7b04efeb-0b36-47f6-9f57-70293e5ee7b2/pages/options.html`

	- __III.__ Paste into the text box, then press `save`

	- __IV.__ Repeat steps 4 - 5 after any changes you make to any of your configuration files.

	</details>

Screenshots
-----------
<!--{{SCREENSHOTS}}-->

Todo
----

- [ ] Include aliased sites in README
- [ ] Add `CHANGELOG.md` using [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [ ] Improve code organization
- [ ] Ensure screenshots have a plain white background
- [ ] Add additional screenshots
- [x] Simplify installation process
- [x] Feed the kittens

Copyright
---------
<!--{{COPYRIGHT}}-->
