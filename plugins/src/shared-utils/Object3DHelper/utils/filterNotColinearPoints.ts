import type { Vector3 } from 'three'
import * as THREE from 'three'
import { vectorIsEqual } from '.'

export function filterNotColinearPoints(positions: Vector3[]): [Vector3, Vector3, Vector3] | void {
  const vector01 = new THREE.Vector3().subVectors(positions[1]!, positions[0]!).normalize()
  const result: Vector3[] = []
  positions.forEach((value, index) => {
    if (result.length >= 3) return
    if (index === 0 || index === 1) return result.push(value)
    const vector = new THREE.Vector3().subVectors(positions[index]!, positions[0]!).normalize()
    if (!vectorIsEqual(vector, vector01) && !vectorIsEqual(vector, vector01.clone().negate())) {
      if (positions.length === 8 && index === 2) console.warn('filterNotColinearPoints: maybe not colinear')
      return result.push(value)
    }
  })
  if (result.length >= 3) return result as [Vector3, Vector3, Vector3]
}
