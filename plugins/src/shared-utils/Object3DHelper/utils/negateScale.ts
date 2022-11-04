import * as THREE from 'three'

export function negateScale(scale: THREE.Vector3) {
  return scale.clone().sub(new THREE.Vector3(1, 1, 1)).negate().add(new THREE.Vector3(1, 1, 1))
}
