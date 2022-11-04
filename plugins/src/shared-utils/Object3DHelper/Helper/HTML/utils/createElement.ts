export function createElement(style?: Partial<CSSStyleDeclaration>, tagName?: string) {
  return setStyle(document.createElement(tagName ?? 'div'), style)
}

export function setStyle(element: HTMLElement, style?: Partial<CSSStyleDeclaration>) {
  if (!style) return element
  for (const key in style) {
    if (key && style[key]) element.style[key as any]! = style[key]!
  }
  return element
}
