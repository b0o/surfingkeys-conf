import api from "../api.js"
import omnibar from "../omnibar.js"
import priv from "../conf.priv.js"

const { Clipboard } = api

// ChatGPT requires the showdown library to convert Markdown to HTML:
//   npm install showdown
import showdown from "showdown"

/**
 * Open the Omnibar with OpenAI results.
 *
 * It requires an API key from OpenAI, to be specified in the priv.js file.
 *
 * @param {Object} options - Options object.
 * @param {string} options.model - The model to use (default: "gpt-3.5-turbo").
 * @param {number} options.maxTokens - The maximum number of tokens to generate (default: 500).
 * @param {Object[]} options.context - The initial context (default: []).
 *
 * Example usage: Add the following in your keys.js file:

import openaiCallback from "./plugins/openai.js"

maps.global = [
  // ...
  // OpenAI
  {
    alias: "ai",
    category: categories.misc,
    description: "Open ChatGPT",
    callback: openaiCallback(),
  },
  // ...
]

*/
export default function(
  {
    model = "gpt-3.5-turbo",
    maxTokens = 500,
    context = [
      {
        role: "system",
        content: "You are a helpful assistant that can answer questions and provide information.",
      },
      {
        role: "system",
        content: "When extra formatting is needed, you can use Markdown.",
      },
    ],
  } = {}
) {
  var _context = [...context]

  return () => {
    omnibar.open({
      multiline: true,
      autocomplete: () => {
        // No autocompletion, predictions are generated only when the user presses Enter
        return []
      },

      onEnter: (item, { ctrlKey, listSelect }) => {
        if (listSelect) {
          // If the user selected a result, copy it to the clipboard
          Clipboard.write(item.text)
          return ""
        }

        if (!ctrlKey) {
          // If the user did not press Ctrl, do not open the result
          // (multi-line input, the user may want to add more text)
          return ""
        }

        const markdown = new showdown.Converter()
        _context.push({ role: "user", content: item.text })

        return new Promise((resolve, reject) => {
          fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${priv.keys.openai}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model,
                messages: _context,
                max_tokens: maxTokens,
              }),
            }
          ).then((response) => {
            response.json().then((data) => {
              const text = data.choices[0].message.content
              resolve({
                text,
                html: markdown.makeHtml(text),
              })
            }).catch((error) => {
              console.error('Could not parse response', error)
              reject(error)
            })
          }).catch((error) => {
            console.error('Could not fetch response', error)
            reject(error)
          })
        })
      },

      onResultClick: (e, item) => {
        e?.preventDefault()
        Clipboard.write(item.text)
      },
    })
  }
}
