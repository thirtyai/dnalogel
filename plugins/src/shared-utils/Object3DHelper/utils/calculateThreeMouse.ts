import * as THREE from 'three'

/**
 * 计算 three 中的 mouse 的值
 * @param  mouseXY - 鼠标相对屏幕位置
 * @param  element - canvas元素（three的展示元素）
 * @param  scissor - 屏幕剪裁
 */
export function calculateThreeMouse(originMouse: { x: number; y: number }, element: HTMLElement) {
  const { offsetWidth: width, offsetHeight: height } = element
  const { top, left } = element.getBoundingClientRect()
  return Object.assign(new THREE.Vector2(), {
    x: ((originMouse.x - left) / width) * 2 - 1,
    y: (-(originMouse.y - top) / height) * 2 + 1,
  })
}
