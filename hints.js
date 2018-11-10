if (typeof Hints === "undefined") {
  module.exports = {
    create: () => {},
    dispatchMouseClick: () => {},
  }
} else {
  module.exports = Hints
}

