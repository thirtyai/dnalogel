import { Vector3 } from 'three'

export function centerPoint(...args: Vector3[]): Vector3 {
  const center = new Vector3()

  args.forEach((point) => {
    center.add(point)
  })

  center.divideScalar(args.length)

  return center
}
