import actions from "../actions.js"
import omnibar from "../omnibar.js"

// Customize it to your liking
const searxUrl = "https://search.fabiomanganiello.com"

/**
 * Open the Omnibar with SearX autocompletion.
 *
 * @param {Object} options - Options object.
 * @param {boolean} options.newTab - Open the result in a new tab (default: false).
 * @param {boolean} options.active - Make the new tab active (default: true).
 *
 * Example usage: Add the following in your keys.js file:

import searxCallback from "./plugins/searx.js"

maps.global = [
  // ...
  // Open URL or search (current tab)
  {
    alias: "go",
    category: categories.pageNav,
    description: "Open URL or search (current tab)",
    callback: searxCallback({newTab: false}),
  },

  // Open URL or search (new tab)
  {
    alias: "t",
    category: categories.pageNav,
    description: "Open URL or search (new tab)",
    callback: searxCallback({newTab: true}),
  },
  // ...
]

 */
export default function({
  newTab = false,
  active = true,
} = {}) {
  return () => {
    omnibar.open({
      autocompleteStartTimeout: 1500,
      newTab,
      active,
      autocomplete: (query) => {
        if (query.url) {
          return [
            {
              text: `🔗 ${query.url}`,
              url: query.url,
            },
          ]
        }

        return new Promise((resolve, reject) => {
          fetch(
            `${searxUrl}/autocompleter`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `q=${encodeURIComponent(query.text)}`,
            }
          ).then((response) => {
            response.json().then((data) => {
              resolve(
                data[1]?.map((item) => {
                  const sanitizedText = item.replace('<', '&lt;').replace('>', '&gt;')
                  return {
                    html: `🔍 <b>${sanitizedText.substring(0, query.text.length)}</b>${sanitizedText.substring(query.text.length)}`,
                    url: `${searxUrl}/search?q=${encodeURIComponent(item)}`,
                  }
                }) || []
              )
            }).catch((error) => {
              console.error('Could not parse autocompletion results', error)
              reject(error)
            })
          }).catch((error) => {
            console.error('Could not fetch autocompletion results', error)
            reject(error)
          })
        })
      },

      onEnter: (item, { shiftKey }) => {
        if (shiftKey) {
          return new Promise((resolve, reject) => {
            fetch(
              `${searxUrl}/search?q=${encodeURIComponent(item.text)}&categories=general&pageno=1&safesearch=0&format=rss`,
            ).then((response) => {
              response.text().then((data) => {
                const parser = new DOMParser()
                const xml = parser.parseFromString(data, "text/xml")
                const items = Array.from(xml.querySelectorAll("item"))
                const results = items
                  .filter((item) => item.querySelector("link") && item.querySelector("title"))
                  .map((item) => ({
                    url: item.querySelector("link").textContent,
                    html: `<b>${item.querySelector("title").textContent}</b><br>${item.querySelector("description")?.textContent}`,
                  }))

                resolve(results)
              }).catch((error) => {
                console.error('Could not parse RSS results', error)
                reject(error)
              })
            }).catch((error) => {
              console.error('Could not fetch RSS results', error)
              reject(error)
            })
          })
        }

        if (!item.url) {
          item.url = `${searxUrl}/search?q=${encodeURIComponent(item.text)}`
        }

        actions.openLink(item.url, { newTab })
      },
    })
  }
}
