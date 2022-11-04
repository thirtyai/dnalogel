import * as THREE from 'three'
import { calculateThreeMouse } from '.'

export function getMouseRaycaster(camera: THREE.Camera, mouse: { x: number; y: number }, element: HTMLElement) {
  if (!mouse || !element || !camera) return
  const threeMouse = calculateThreeMouse(mouse, element)
  if (Math.abs(threeMouse.x) === 1 || Math.abs(threeMouse.y) === 1) return
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(threeMouse, camera)
  return raycaster
}
