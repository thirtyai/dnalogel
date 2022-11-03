import * as THREE from 'three'

export function getCoordsFromClient(position: { x: number; y: number }, element: HTMLElement) {
  const { offsetWidth: width, offsetHeight: height } = element
  const { top, left } = element.getBoundingClientRect()
  return new THREE.Vector2().set(((position.x - left) / width) * 2 - 1, (-(position.y - top) / height) * 2 + 1)
}

export function getCoordsFromElement(position: { x: number; y: number }, element: HTMLElement) {
  const { offsetWidth: width, offsetHeight: height } = element
  return new THREE.Vector2().set((position.x / width) * 2 - 1, (-position.y / height) * 2 + 1)
}
