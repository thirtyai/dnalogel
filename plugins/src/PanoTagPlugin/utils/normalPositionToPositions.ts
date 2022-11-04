import type { Vector3 } from 'three'
import * as THREE from 'three'
import { arrayPositionToVector3 } from '.'

export function normalPositionToPositions(cameraPosition: Vector3, position: Vector3, normal: Vector3) {
  const squareHalfSize = 0.01
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, position)
  const right = position.clone().sub(cameraPosition).cross(new THREE.Vector3(0, 1, 0)).setLength(squareHalfSize)
  const top = new THREE.Vector3(0, squareHalfSize, 0)
  const positions = [
    position.clone().sub(right).sub(top), // 左下
    position.clone().add(right).sub(top), // 右下
    position.clone().add(right).add(top), // 右上
    position.clone().sub(right).add(top), // 左上
  ].map((v) => plane.projectPoint(v, new THREE.Vector3())) as [Vector3, Vector3, Vector3, Vector3]
  // debug
  // const geometry = new THREE.SphereGeometry(0.005, 16, 16)
  // const spheres: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = []
  // const materials = [
  //   new THREE.MeshBasicMaterial({ color: 0xffff00 }), // 黄
  //   new THREE.MeshBasicMaterial({ color: 0xff00ff }), // 粉
  //   new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 红
  //   new THREE.MeshBasicMaterial({ color: 0x00ffff }), // 蓝
  // ]
  // positions.forEach((p, index) => {
  //   const material = materials[index]!
  //   const sphere = new THREE.Mesh(geometry, material)
  //   sphere.position.copy(p)
  //   spheres.push(sphere)
  // })
  // spheres.forEach((sphere) => {
  //   sphere.material.depthTest = false
  //   window.five.scene.add(sphere)
  // })
  // const axesHelper = new THREE.AxesHelper(20)
  // window.five.scene.add(axesHelper)
  // debug end
  return positions
}
