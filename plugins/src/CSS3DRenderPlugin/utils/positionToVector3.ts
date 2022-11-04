import { Vector3 } from 'three'

export type AnyPosition = Vector3 | [number, number, number] | { x: number; y: number; z: number }

export const positionToVector3 = ({ x, y, z }: { x: number; y: number; z: number }) => new Vector3(x, y, z)

export const arrayPositionToVector3 = ([x, y, z]: [number, number, number]) => new Vector3(x, y, z)

export const anyPositionToVector3 = (position: AnyPosition) => {
  if (position instanceof Vector3) return position
  else if (Array.isArray(position)) return arrayPositionToVector3(position)
  else return positionToVector3(position)
}
