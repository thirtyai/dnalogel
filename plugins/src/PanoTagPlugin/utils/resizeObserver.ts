export function resizeObserver(func: () => any, element?: HTMLElement) {
  if (!element || typeof ResizeObserver === 'undefined' || !ResizeObserver) {
    return {
      observe: () => window.addEventListener('resize', func),
      unobserve: () => window.removeEventListener('resize', func),
    }
  } else {
    const observer = new ResizeObserver(func)
    return {
      observe: () => observer.observe(element),
      unobserve: () => observer.unobserve(element),
    }
  }
}
