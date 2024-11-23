import actions from "./actions.js"

const { Front } = api
const omnibar = {}

/**
 * Opens a custom Omnibar UI.
 *
 * @param {object} options - The options for the Omnibar.
 * @param {function} options.onEnter - The function to call when an item is selected.
 *   It can return a string to display as a message, or a list of strings, or a list of objects
 *   having `text` and `url` properties. The default function opens the selected URL in a new tab
 *   if it has a URL property. Its arguments are the selected item (an object with `text` and `url`)
 *   and the options object, containing `newTab` and `active` properties.
 * @param {function} options.onShiftEnter - The function to call when an item is selected with Shift+Enter.
 *   By default, it points to the same function as `onEnter`.
 * @param {function} options.onResultClick - The function to call when a result is clicked.
 *   It takes two parameters: the click event and the result object.
 *   By default, it points to `null`, meaning that the `onEnter` function will be called for the clicked result.
 * @param {function} options.autocomplete - The function to call to get autocomplete results.
 *   It can return a string to display as a message, or a list of strings, or a list of objects
 *   having `text` and `url` properties. Its argument is an object with `text` and `url` properties.
 * @param {boolean} options.newTab - Whether to open the selected item in a new tab (default: false).
 * @param {boolean} options.active - Whether the new tab should be active (default: true).
 * @param {string} options.placeholder - The placeholder text for the input field (default: "").
 * @param {number} options.autocompleteStartTimeout - The timeout in milliseconds to wait before
 *   calling the autocomplete function (default: 1000).
 */
omnibar.open = (
  {
    onEnter = (item, props) => {
      if (!item.url) {
        return "No URL provided"
      }

      actions.openLink(item.url, props)
    },
    onShiftEnter = onEnter,
    onResultClick = null,
    autocomplete = () => [],
    newTab = false,
    active = true,
    placeholder = "",
    autocompleteStartTimeout = 1000,
  } = {}
) => {
  let results = [],
      focusedResult = -1,
      listItems = [],
      inputText = "",
      inputUrl = null,
      abortController = null,
      autocompleteTimeout = null,
      originalHandlers = {}

  var iframe, input, list, cachedPromise, omnibar
  const _onResultClick = onResultClick || ((_, result) => onEnter(result, { newTab, active }))

  /**
   * Creates the custom Omnibar UI.
   */
  const init = () => {
    iframe = (
      [...document.body.parentElement.children]
        .filter((el) => !!el.shadowRoot)
        .map((el) => el.shadowRoot.activeElement)
        .filter((el) => el.classList?.contains('sk_ui'))
    )?.[0]

    if (!iframe) {
      console.error("Omnibar not found")
      return
    }

    const body = iframe.contentWindow.document.body
    omnibar = body.querySelector('#sk_omnibar')
    input = body.querySelector('#sk_omnibarSearchArea input')
    list = body.querySelector('#sk_omnibarSearchResult')

    if (!(omnibar && input && list)) {
      // XXX: This is a workaround for the Omnibar not being ready yet.
      //   It should probably be replaced by a reactive callback, but at
      //   the moment that `Front.openOmnibar` is called the Omnibar DOM
      //   is not yet ready.
      setTimeout(init, 100)
      return
    }

    originalHandlers = {
      onkeydown: input.onkeydown,
      onkeyup: input.onkeyup,
      oninput: input.oninput,
    }

    input.placeholder = placeholder
    input.onkeydown = _onKeyDown
    input.onkeyup = _onKeyUp
    input.oninput = _onInput
    reset()
  }

  /**
   * Closes the Omnibar and resets the state.
   */
  const close = () => {
    if (omnibar) {
      omnibar.style.display = "none"
    }

    reset()
    Object.entries(originalHandlers).forEach(([key, value]) => {
      input[key] = value
    })
  }

  /**
   * Resets the state of the Omnibar.
   */
  const reset = () => {
    input.value = ""
    inputText = ""
    inputUrl = null
    results = []
    focusedResult = -1
    listItems = []
    list.innerHTML = ""
    cancel()
  }

  /**
   * Cancels the cached promise.
   */
  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }

    if (autocompleteTimeout) {
      clearTimeout(autocompleteTimeout)
      autocompleteTimeout = null
    }
  }

  /**
   * Selects a result.
   *
   * @param {object} result - The result to select. If not provided:
   *  - If a result is focused, selects that result.
   *  - Otherwise, selects the default result.
   */
  const select = (result, { shiftKey = false } = {}) => {
    if (!result) {
      result = (focusedResult >= 0 && focusedResult < results.length)
        ? results[focusedResult] : { text: inputText, url: inputUrl }
    }

    const fun = shiftKey ? onShiftEnter : onEnter
    const ret = fun(result, { newTab, active })
    const reset = () => {
      results = []
      focusedResult = -1
    }

    if (ret == null) {
      close()
    } else if (ret instanceof Promise) {
      reset()
      ret.then((response) => {
        if (response == null) {
          close()
          return
        }

        if (!Array.isArray(response)) {
          response = [response]
        }

        results = response
        _renderResults(response)
      })
    } else {
      reset()
      results = ret
      _renderResults(ret)
    }
  }

  /**
   * Updates the Omnibar with the given input.
   *
   * @param {list} results - The list of results to display,
   *  each with a `text` and `url` property, or as a string.
   */
  const _renderResults = (results) => {
    list.innerHTML = ""
    listItems = []

    results.forEach((result) => {
      const ul = document.createElement('ul')
      const li = document.createElement('li')
      const container = document.createElement('div')
      const text = document.createElement('div')

      container.classList.add('text-container')
      text.classList.add('text')

      if (result.html) {
        text.innerHTML = result.html
      } else {
        text.innerText = result.text || result
      }

      li.onclick = (e) => _onResultClick(e, result)
      listItems.push(li)
      container.appendChild(text)

      if (result.url?.length) {
        const url = document.createElement('div')
        url.classList.add('url')
        url.innerText = result.url
        container.appendChild(url)
      }

      let iconSrc = result.icon
      if (iconSrc?.length) {
        const icon = document.createElement('img')
        icon.classList.add('icon')
        icon.src = iconSrc
        li.appendChild(icon)
      }

      li.appendChild(container)
      ul.appendChild(li)
      list.appendChild(ul)
    })
  }

  /**
   * Focuses the result at the given index.
   *
   * @param {number} index - The index of the result to focus.
   */
  const _focusResult = (index) => {
    if (index < 0 || index >= results.length) {
      index = -1
    }

    focusedResult = index
    listItems.forEach((li, i) => {
      if (i === index) {
        li.classList.add('focused')
      } else {
        li.classList.remove('focused')
      }
    })
  }

  /**
   * Handles keydown events for the Omnibar.
   *
   * @param {KeyboardEvent} e - The keydown event.
   */
  const _onKeyDown = (e) => {
    if (e.key === "Escape") {
      close()
    }
  }

  /**
   * Handles keyup events for the Omnibar.
   *
   * @param {KeyboardEvent} e - The keyup event.
   */
  const _onKeyUp = (e) => {
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      if (!results.length) {
        return
      }

      _focusResult((focusedResult + 1) % results.length)
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      if (!results.length) {
        return
      }

      _focusResult((focusedResult - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      select(results[focusedResult], { shiftKey: e.shiftKey })
    }
  }

  /**
   * Handles input events for the Omnibar.
   *
   * @param {InputEvent} e - The input event.
   */
  const _onInput = (e) => {
    if (e.target.value === inputText) {
      return
    }

    inputText = e.target.value
    try {
      inputUrl = new URL(inputText).href
    } catch (e) {
      inputUrl = null
    }

    cancel()
    autocompleteTimeout = setTimeout(() => {
      const text = inputText.trim()
      if (!text) {
        return
      }

      cachedPromise = new Promise((resolve, reject) => {
        const abortListener = () => reject(new Error("Aborted"))
        abortController = new AbortController()
        abortController.signal.addEventListener("abort", abortListener)

        const ret = autocomplete({
          text,
          url: inputUrl,
        })

        if (ret instanceof Promise) {
          ret.then(resolve).catch(reject)
        } else {
          resolve(ret)
        }
      })

      cachedPromise.then((response) => {
        if (response == null) {
          response = []
        }

        if (!Array.isArray(response)) {
          response = [response]
        }

        results = response
        _renderResults(results)
      })
    }, autocompleteStartTimeout)
  }

  Front.openOmnibar({
    type: "SearchEngine",
  })

  setTimeout(init, 100)
}

export default omnibar

/**
  * Example implememtation: custom omnibar backed by a Searx instance.
  * It supports the following features:
  *
  *   - If a URL is provided, it opens it directly.
  *   - If a search query is provided, it autocompletes it using Searx and displays the results.
  *   - If <ENTER> is pressed, it opens either the selected autocompletion result or the search query.
  *   - If <SHIFT>+<ENTER> is pressed, it fetches the search results using Searx and displays them.
  *   - `newTab` and `active` options are supported.
  */

// const searxUrl = "https://searchx.example.com"
//
// const searxCallback = ({newTab = false} = {}) => {
//   return () => {
//     omnibar.open({
//       autocompleteStartTimeout: 1500,
//       newTab,
//       autocomplete: (query) => {
//         if (query.url) {
//           return [
//             {
//               text: `🔗 ${query.url}`,
//               url: query.url,
//             },
//           ]
//         }
//
//         return new Promise((resolve, reject) => {
//           fetch(
//             `${searxUrl}/autocompleter`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//               },
//               body: `q=${encodeURIComponent(query.text)}`,
//             }
//           ).then((response) => {
//             response.json().then((data) => {
//               resolve(
//                 data[1]?.map((item) => {
//                   const sanitizedText = item.replace('<', '&lt;').replace('>', '&gt;')
//                   return {
//                     html: `🔍 <b>${sanitizedText.substring(0, query.text.length)}</b>${sanitizedText.substring(query.text.length)}`,
//                     url: `${searxUrl}/search?q=${encodeURIComponent(item)}`,
//                   }
//                 }) || []
//               )
//             }).catch((error) => {
//               console.error('Could not parse autocompletion results', error)
//               reject(error)
//             })
//           }).catch((error) => {
//             console.error('Could not fetch autocompletion results', error)
//             reject(error)
//           })
//         })
//       },
//
//       onEnter: (item) => {
//         if (!item.url) {
//           item.url = `${searxUrl}/search?q=${encodeURIComponent(item.text)}`
//         }
//
//         actions.openLink(item.url, { newTab })
//       },
//
//       onShiftEnter: (item) => {
//         return new Promise((resolve, reject) => {
//           fetch(
//             `${searxUrl}/search?q=${encodeURIComponent(item.text)}&categories=general&pageno=1&safesearch=0&format=rss`,
//           ).then((response) => {
//             response.text().then((data) => {
//               const parser = new DOMParser()
//               const xml = parser.parseFromString(data, "text/xml")
//               const items = Array.from(xml.querySelectorAll("item"))
//               const results = items
//                 .filter((item) => item.querySelector("link") && item.querySelector("title"))
//                 .map((item) => ({
//                   url: item.querySelector("link").textContent,
//                   html: `<b>${item.querySelector("title").textContent}</b><br>${item.querySelector("description")?.textContent}`,
//                 }))
//
//               resolve(results)
//             }).catch((error) => {
//               console.error('Could not parse RSS results', error)
//               reject(error)
//             })
//           }).catch((error) => {
//             console.error('Could not fetch RSS results', error)
//             reject(error)
//           })
//         })
//       },
//     })
//   }
// }

/* Then, in your maps.global (keys.js): */

// import omnibar from "./omnibar.js"
//
// maps.global = [
//   // ...
//   // Open URL or search (current tab)
//   {
//     alias: "go",
//     category: categories.pageNav,
//     description: "Open URL or search (current tab)",
//     callback: searxCallback({newTab: false}),
//   },
//
//   // Open URL or search (new tab)
//   {
//     alias: "t",
//     category: categories.pageNav,
//     description: "Open URL or search (new tab)",
//     callback: searxCallback({newTab: true}),
//   },
//   // ...
// ]
