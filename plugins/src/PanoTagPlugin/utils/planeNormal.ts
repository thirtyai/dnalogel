import type { Plane, Vector3 } from 'three'
import { anyPositionToVector3, AnyPosition } from '.'

export function planeNormal(points: [AnyPosition, AnyPosition, AnyPosition] | [AnyPosition, AnyPosition, AnyPosition, AnyPosition]): Vector3
export function planeNormal(points: AnyPosition[]): Vector3 | void
export function planeNormal(points: AnyPosition[]) {
  if (points.length < 3) return
  const vector3Points = points.map(anyPositionToVector3) as [Vector3, Vector3, Vector3]
  const vector01 = vector3Points[1].clone().sub(vector3Points[0]) // 点0 -> 点1 的向量
  const vector12 = vector3Points[2].clone().sub(vector3Points[1]) // 点1 -> 点2 的向量
  return vector01.cross(vector12)
}
