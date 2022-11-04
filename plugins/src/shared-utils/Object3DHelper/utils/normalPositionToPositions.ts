import type { Vector3 } from 'three'
import * as THREE from 'three'
import { arrayPositionToVector3 } from '.'

// eslint-disable-next-line max-params
export function normalPositionToPositions(
  cameraPosition: Vector3,
  position: Vector3,
  normal: Vector3,
  config?: { width?: number; height?: number },
) {
  const squareHeightHalfSize = (config?.height || 0.01) / 2
  const squareWidthHalfSize = (config?.width || 0.01) / 2
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, position)
  const right = position.clone().sub(cameraPosition).cross(new THREE.Vector3(0, 1, 0)).setLength(squareWidthHalfSize)
  const top = new THREE.Vector3(0, squareHeightHalfSize, 0)
  const positions = [
    position.clone().sub(right).sub(top), // 左下
    position.clone().add(right).sub(top), // 右下
    position.clone().add(right).add(top), // 右上
    position.clone().sub(right).add(top), // 左上
  ].map((v) => plane.projectPoint(v, new THREE.Vector3())) as [Vector3, Vector3, Vector3, Vector3]

  return positions
}
