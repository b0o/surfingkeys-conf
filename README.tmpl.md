<!--{{NOTICE}}-->

# Maddison's SurfingKeys Configuration

This is my configuration for the [SurfingKeys](https://github.com/brookhong/Surfingkeys) browser extension.

It includes:

- [<!--{{KEYS_MAPS_COUNT}}--> key mappings for <!--{{KEYS_SITES_COUNT}}--> unique websites](#site-specific-key-mappings) which **automate many common actions**.
- [Omnibar integration with <!--{{SEARCH_ENGINES_COUNT}}--> Search Engines and Knowledge Sources](#omnibar-search-engine-integrations), many of which include **inline images** and **instant answers**.

## Table of Contents

1. [Site-Specific Key Mappings](#site-specific-key-mappings)
2. [Omnibar Search Engine Integrations](#omnibar-search-engine-integrations)
3. [Installation Instructions](#installation)
4. [Screenshots](#screenshots)
5. [License](#license)

## Features

### Site-Specific Key Mappings

<table>
<tbody>
<!--{{KEYS_TABLE}}-->
</tbody>
</table>

### Omnibar Search Engine Integrations

To open the omnibar integration for a search engine, press the search leader key (`a` by default) followed by the alias for the desired search engine, as found in the table below.

For example, to open the Wikipedia omnibar integration, type `awp`.

<table>
<thead>
<th colspan=2>Alias</th>
<th>Name</th>
<th>Domain</th>
<th>Screenshots</th>
</thead>
<tbody>
<!--{{SEARCH_ENGINES_TABLE}}-->
</tbody>
</table>

<a href="#optional-private-api-key-configuration">&#8727; requires private API key</a>

## Installation

Requires **`Surfingkeys v1.0.0 or newer`**.

### Pre-built

_Coming soon!_

### Build and Install

#### Dependencies

- **git**
- **node.js v17**

#### Procedure

1.  **Clone**

    ```shell
    $ git clone http://github.com/b0o/surfingkeys-conf
    $ cd surfingkeys-conf
    ```

2.  **Install Node.js dependencies**

    ```shell
    $ npm install
    ```

3.  **Gulp Build/Install**

    ```shell
    $ npm run gulp install # OR "npm run gulp build" to build to ./build/surfingkeys.js without installing
    ```

    This will build the final configuration file and place it at `~/.config/surfingkeys.js`.
    If you already have a file in that location, make sure you back it up first!

4.  **Load your configuration into the SurfingKeys Extension**

    <details>
    <summary><strong>Option A</strong> <em>(recommended)</em>: Configure SurfingKeys to automatically load the configuration file</summary>
    <blockquote><details>
    <summary><strong>Local File Access (Chrome/Chromium only)</strong></summary>

    - **I.** Visit `chrome://extensions/` and enable `Allow access to file URLs` for the Surfingkeys extension.

    - **II.** Open the SurfingKeys configuration page: `chrome-extension://gfbliohnnapiefjpjlpjnehglfpaknnc/pages/options.html`.

    - **III.** Set the `Load settings from` option to point to the configuration file.

      _Note: you must specify the full, absolute path; the tilde `~` or environment variables like `$HOME` won't work_:

      - __Linux__: `file:///home/{USERNAME}/.config/surfingkeys.js` (replace `{USERNAME}` with your username)
      - __macOS__: `file:///Users/{USERNAME}/.config/surfingkeys.js` (replace `{USERNAME}` with your username)
      - __Windows__: `file://%Homedrive%%Homepath%/surfingkeys.js` (This is a guess, please correct me if I'm wrong)

    - **IV.** Repeat these steps after you make any changes to your configuration files. Your new configuration will be automatically loaded by SurfingKeys.

    </details></blockquote>
    <blockquote><details>
    <summary><strong>Local Web Server (Chrome, Chromium, and Firefox)</strong></summary>

    - **I.** Run the configuration file server:

      ```shell
      $ gulp serve-simple
      ```

      Alternatively, you can use the `gulp serve` task, which automatically rebuilds the configuration file whenever a source file is modified.

    - **II.** Open the SurfingKeys configuration page:

      Chrome: `chrome-extension://gfbliohnnapiefjpjlpjnehglfpaknnc/pages/options.html`

      Firefox: `moz-extension://7b04efeb-0b36-47f6-9f57-70293e5ee7b2/pages/options.html`

    - **III.** Set the `Load settings from` option to `http://localhost:9919`

    - **IV.** SurfingKeys will lose the settings as soon as the local web server shuts down. You will likely want to configure your system to automatically
      start the server on login.

      If you run Linux with systemd, an [example user service](./extra/surfingkeys-conf.service) is provided in this repo. You will need to modify
      it to contain the proper path to your `surfingkeys-conf` repo.

    - **V.** Repeat the `npm run gulp build` command from step 4 above after you make any changes to your configuration files.
      Your new configuration will be automatically loaded by the web server and SurfingKeys will pick it up the next time you load a webpage.

    - **Note:** This method starts a local web server on `localhost:9919` which serves your built configuration file. Depending on your firewall configuration,
      other devices on your network may be able to read your configuration file, including any private API keys or other secrets you have configured in `conf.priv.js`.
      Proceed with caution.

    </details></blockquote>
    </details>
    <details>
    <summary><strong>Option B</strong>: Manually copy/paste into the SurfingKeys configuration form</summary>

    - **I.** Copy the contents of `./build/surfingkeys.js` (or `$HOME/.config/surfingkeys.js` if you ran `gulp install`)

    - **II.** Paste the contents into the SurfingKeys configuration page:

      Chrome: `chrome-extension://gfbliohnnapiefjpjlpjnehglfpaknnc/pages/options.html`

      Firefox: `moz-extension://7b04efeb-0b36-47f6-9f57-70293e5ee7b2/pages/options.html`

    - **III.** Repeat these steps after you make any changes to your configuration files. Your new configuration will be automatically loaded by SurfingKeys.

    </details>

### Optional: Private API Key Configuration

Some omnibar search engine integrations require private API keys for access (marked with a &#8727; in [the table](#omnibar-search-engine-integrations) above).
These keys are to be defined in `./src/conf.priv.js`, which should be created based on the template: [`./src/conf.priv.example.js`](./src/conf.priv.example.js).
The template contains instructions on how to generate each API key.

Note: The `./src/conf.priv.js` does not exist in the repository, you need to copy the template file. The `conf.priv.js` should not be commited!

1. Copy the example private configuration:

```shell
$ cp ./src/conf.priv.example.js ./src/conf.priv.js
```

2. Open `./src/conf.priv.js` in your favorite editor and follow the instructions inside:

```shell
$ vim ./src/conf.priv.js
```

## Screenshots

<!--{{SCREENSHOTS}}-->

## Copyright

<!--{{COPYRIGHT}}-->
