export default `
  body {
    font-family: "Input Mono", "DejaVu Sans Mono", DejaVu, Arial, sans-serif;
    font-size: 12pt;
  }

  #sk_keystroke kbd {
    font-family: "Sudo Nerd Font Mono", "Sudo Mono", "Sudo",
      "Input Mono Nerd Font", "Input Mono", "DejaVu Sans Mono", "DejaVu", "Arial",
      sans-serif;
    font-size: 10pt;
  }

  #sk_omnibarSearchArea {
    margin: 0 !important;
    padding: 0.5rem 1rem !important;
    border-bottom: none !important;
  }

  #sk_omnibarSearchResult {
    margin: 0 !important;
  }

  #sk_omnibar li {
    background: none !important;
    padding: 0.35rem 0.5rem !important;
  }

  #sk_omnibarSearchResult > ul:nth-child(1) {
    margin-bottom: 0px !important;
    padding: 0 !important;
    padding-bottom: 10px !important;
  }

  #sk_omnibar .separator {
    padding-left: 8px !important;
  }

  @media (prefers-color-scheme: light) {
    body {
      color: #483270;
    }

    #sk_omnibar {
      background-color: #f5f3fd !important;
      color: #59446f !important;
      box-shadow: 0px 3px 15px -6px rgba(53, 13, 81, 0.7) !important;
    }

    #sk_omnibar .prompt {
      color: #c2b2d7 !important;
    }

    #sk_omnibar .separator {
      color: #d4b1ff !important;
    }

    #sk_omnibar input {
      color: #351d53 !important;
    }

    #sk_omnibarSearchResult {
      border-top: 1px solid #e1cff5 !important;
    }

    #sk_omnibar li.focused {
      background-color: #e1ddff !important;
      color: #351d53 !important;
    }

    #sk_banner,
    #sk_keystroke {
      border: 1px solid #d7b0ff;
      background: #e9d9ee;
    }

    #sk_keystroke .annotation {
      color: #483270;
    }

    #sk_keystroke kbd {
      color: black;
      background: white;
    }

    #sk_keystroke kbd .candidates {
      color: #ff7a75;
    }
  }

  @media (prefers-color-scheme: dark) {
    body {
      color: #d7b0ff;
    }

    #sk_omnibar {
      background-color: #2a323e;
      color: #cad1d7;
    }

    #sk_omnibar .prompt {
      color: #eef5fb !important;
    }

    #sk_omnibar .separator {
      color: #8af4ff !important;
      padding-left: 8px !important;
    }

    #sk_omnibar input {
      color: white !important;
    }

    #sk_omnibarSearchResult {
      border-top: 1px solid #545f6f !important;
    }

    #sk_omnibar li.focused {
      background: #181d24 !important;
      color: #eef5fb !important;
    }

    #sk_banner,
    #sk_keystroke {
      border: 1px solid #d7b0ff;
      background: #483270;
    }

    #sk_keystroke .annotation {
      color: #d7b0ff;
    }

    #sk_keystroke kbd {
      color: #fff;
      background: #7a57a4;
      border: 1px solid #2d0080;
      box-shadow: none;
    }

    #sk_keystroke kbd .candidates {
      color: #ff8cf8;
    }
  }

  /* Disable RichHints CSS animation */
  .expandRichHints {
    animation: none;
  }
  .collapseRichHints {
    animation: none;
  }
`
