import type * as THREE from 'three'

export function vectorIsEqual(vector1: THREE.Vector3, vector2: THREE.Vector3) {
  const accuracy = 0.00001
  if (Math.abs(vector1.x - vector2.x) > accuracy) return false
  if (Math.abs(vector1.y - vector2.y) > accuracy) return false
  if (Math.abs(vector1.z - vector2.z) > accuracy) return false
  return true
}
