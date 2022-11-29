import { even } from './even'

export default function createResizeObserver(
  element: Element,
  resizeHandler: (width: number, height: number) => any,
  fireImmediately = true,
) {
  if (!element) {
    console.error('createResizeObserver: element is undefined')
    return { observe: () => {}, unobserve: () => {} }
  }

  const resizeObserverHandler = () => {
    /**
     * 这里even策略是遇到奇数会加1，在某些浏览器中会触发滚动条显示，导致fiveElement变小，fiveElement变小又触发了这里的resize，宽高变小，滚动条消失，然后又触发resize。。。无限循环
     * 所以为了规避上面这种情况，even设置了一个参数，遇到奇数可选择减一
     */
    const width = even(element.clientWidth, { floor: true })
    const height = even(element.clientHeight, { floor: true })
    resizeHandler(width, height)
  }

  if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
    console.warn('createResizeObserver: ResizeObserver is undefined')
    return { observe: () => resizeObserverHandler(), unobserve: () => {} }
  }

  const observer = new ResizeObserver(resizeObserverHandler)
  if (fireImmediately) resizeObserverHandler()
  return {
    observe: () => observer.observe(element),
    unobserve: () => observer.unobserve(element),
  }
}
