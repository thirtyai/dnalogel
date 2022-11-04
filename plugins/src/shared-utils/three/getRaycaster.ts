import * as THREE from 'three'
import type { Five } from '@realsee/five'
import { getCoordsFromElement } from './getCoords'

export function getRaycasterFromFivePointer(five: Five, pointer: { x: number; y: number }) {
  const fiveElement = five.getElement()
  if (!fiveElement) return

  const coords = getCoordsFromElement(pointer, fiveElement)
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(coords, five.camera)
  return raycaster
}
