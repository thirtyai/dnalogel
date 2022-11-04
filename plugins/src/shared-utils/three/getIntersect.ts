import * as THREE from 'three'
import type { Five } from '@realsee/five'

export function getIntersectFromRelativePosition(five: Five, position: { x: number; y: number }) {
  const { x: left, y: top } = position
  const x = left * 2 - 1
  const y = top * 2 - 1
  const coords = new THREE.Vector2().fromArray([x, y])
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(coords, five.camera)
  const intersects = five.model.intersectRaycaster(raycaster) as THREE.Intersection[]
  return intersects[0]
}
