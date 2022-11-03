import type { Vector3 } from 'three'
import { anyPositionToVector3, AnyPosition, centerPoint } from '.'

export function tagPosition(position: AnyPosition | [AnyPosition, AnyPosition, AnyPosition, AnyPosition]) {
  if (Array.isArray(position) && position.length === 4) {
    const vector3Positions = position.map(anyPositionToVector3) as [Vector3, Vector3, Vector3, Vector3]
    return centerPoint(vector3Positions[0], vector3Positions[2])
  } else {
    return anyPositionToVector3(position)
  }
}
