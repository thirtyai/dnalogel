import type { Direction4 } from '../../typings'
import { createElement } from './utils/createElement'

interface Square {
  element: HTMLElement
  direction: Direction4
}

export function rectangleScaleDom() {
  const container = createElement({
    width: '100%',
    height: '100%',
    left: '0',
    top: '0',
    position: 'absolute',
    pointerEvents: 'none',
  })
  const wrapper = createElement({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    left: '0',
    top: '0',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })
  const border = createElement({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    left: '0',
    top: '0',
    position: 'absolute',
    border: '1px solid rgba(255,255,255,0.4)',
  })
  // DELETE
  // const text = createElement({ fontSize: '50px' })
  // text.innerText = '这是正面'
  // wrapper.appendChild(text)

  container.appendChild(wrapper)
  wrapper.appendChild(border)

  /**
   *  6----5----4
   *  |         |
   *  7         3
   *  |         |
   *  0----1----2
   */
  const offset = '-4px'
  const square0: Square = { direction: 'nesw', element: squareDom({ cursor: 'nesw-resize', left: offset, bottom: offset }) }
  const square1: Square = { direction: 'ns', element: squareDom({ cursor: 'ns-resize', bottom: offset }) }
  const square2: Square = { direction: 'nwse', element: squareDom({ cursor: 'nwse-resize', right: offset, bottom: offset }) }
  const square3: Square = { direction: 'ew', element: squareDom({ cursor: 'ew-resize', right: offset }) }
  const square4: Square = { direction: 'nesw', element: squareDom({ cursor: 'nesw-resize', right: offset, top: offset }) }
  const square5: Square = { direction: 'ns', element: squareDom({ cursor: 'ns-resize', top: offset }) }
  const square6: Square = { direction: 'nwse', element: squareDom({ cursor: 'nwse-resize', left: offset, top: offset }) }
  const square7: Square = { direction: 'ew', element: squareDom({ cursor: 'ew-resize', left: offset }) }

  // 0,2,4,6 四个角放后面，当点击区域可能出现互相遮挡的情况时，优先保障四个角的点
  new Array(square1, square3, square5, square7, square0, square2, square4, square6).forEach((square) => wrapper.appendChild(square.element))
  const squares: [Square, Square, Square, Square, Square, Square, Square, Square] = [
    square0,
    square1,
    square2,
    square3,
    square4,
    square5,
    square6,
    square7,
  ]
  return { container, squares }
}

export function backgroundDom() {
  return createElement({
    width: '100%',
    height: '100%',
    left: '0',
    top: '0',
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.15)',
    pointerEvents: 'none',
  })
}

function squareDom(style?: Partial<CSSStyleDeclaration>) {
  const square = createElement({
    background: '#FFFFFF',
    width: '9px',
    height: '9px',
    position: 'absolute',
    pointerEvents: 'none',
    ...style,
  })
  const squareDraggingWrapper = createElement({
    width: '15px',
    height: '15px',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  })
  const squareDragging = createElement({
    width: '15px',
    height: '15px',
    cursor: style?.cursor,
    pointerEvents: 'auto',
    // backgroundColor: 'red',
    background: 'transparent',
  })
  squareDragging.draggable = true
  squareDraggingWrapper.appendChild(squareDragging)
  square.appendChild(squareDraggingWrapper)
  return square
}
