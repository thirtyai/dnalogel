import { createElement } from './utils/createElement'

export function tipsDom(style?: Partial<CSSStyleDeclaration>) {
  const element = createElement({
    position: 'absolute',
    display: 'block',
    borderRadius: '4px',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: '4px',
    paddingRight: '4px',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: '9999',
    backgroundColor: 'rgba(0,0,0,0.7)',
    fontSize: '12px',
    color: '#fff',
    letterSpacing: '0',
    lineHeight: '18px',
    ...style,
  })
  const show = () => {
    if (element.style.display === 'block') return
    if (!element.style.top) return
    if (!element.style.left) return
    element.style.display = 'block'
  }
  const hide = () => {
    element.style.display = 'none'
    element.style.top = ''
    element.style.left = ''
  }
  const setLeftTop = (left: string, top: string) => {
    element.style.left = left
    element.style.top = top
    show()
  }
  return { element, show, hide, setLeftTop }
}
