import * as THREE from 'three'

const meshes: any[] = []

export default function getPoint(position = new THREE.Vector3(1, 1, 1), colorIndex = 0) {
  const geometry = new THREE.SphereGeometry(0.02, 16, 16)
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xffff00 }), // 黄
    new THREE.MeshBasicMaterial({ color: 0xff00ff }), // 粉
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 红
    new THREE.MeshBasicMaterial({ color: 0x00ffff }), // 蓝
  ]
  const material = materials[colorIndex]!
  const sphere = new THREE.Mesh(geometry, material)
  material.depthTest = false
  material.transparent = true
  material.opacity = 0.6
  material.side = THREE.DoubleSide
  sphere.position.copy(position)
  meshes.push(sphere)
  return sphere
}

export function getAllMesh() {
  return meshes
}
