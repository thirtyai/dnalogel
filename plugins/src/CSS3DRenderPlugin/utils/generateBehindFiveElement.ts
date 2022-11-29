import type { Five } from '@realsee/five'

const behindFiveElement = document.createElement('div')
behindFiveElement.style.position = 'absolute'
behindFiveElement.style.top = '0'
behindFiveElement.style.left = '0'
behindFiveElement.style.width = '100%'
behindFiveElement.style.height = '100%'
behindFiveElement.style.pointerEvents = 'none'

export default function generateBehindFiveElement(five: Five) {
  const element = checkElement(five.getElement()) ?? checkElement(five.getElement()?.parentElement)
  if (element?.parentElement) {
    element.parentElement.insertBefore(behindFiveElement, element)
    return behindFiveElement
  } else {
    console.error(
      'Can not find a valid element to insert behindFiveElement. How to fix it: https://github.com/realsee-developer/dnalogel/blob/main/plugins/src/PanoTagPlugin/README.md',
    )
  }
}

function checkElement(element?: HTMLElement | null) {
  if (!element) {
    return
  }

  const position = element.style.position ?? getComputedStyle(element).position
  if (position !== 'fixed' && position !== 'absolute' && position !== 'relative') {
    return
  }

  const backgroundColor = getComputedStyle(element).backgroundColor
  const backgroundNotTransparent = backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)'

  if (backgroundNotTransparent) {
    return
  }

  return element
}
