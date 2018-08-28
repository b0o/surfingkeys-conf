const isRectVisibleInViewport = rect => (
  rect.height > 0 &&
  rect.width > 0 &&
  rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
)

const isElementInViewport = e => isRectVisibleInViewport(e.getBoundingClientRect())

module.exports = { isRectVisibleInViewport, isElementInViewport }
