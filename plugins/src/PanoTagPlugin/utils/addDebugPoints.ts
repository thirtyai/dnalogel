import type { Five } from '@realsee/five'
import { arrayPositionToVector3 } from '../utils'
import * as THREE from 'three'
import type { Tag } from '../typings'

export function addDebugPoints(five: Five, tags: Tag[]) {
  tags.forEach((tag) => {
    const geometry = new THREE.SphereGeometry(0.02, 16, 16)
    const spheres = []
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // 黄
      new THREE.MeshBasicMaterial({ color: 0xff00ff }), // 粉
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // 红
      new THREE.MeshBasicMaterial({ color: 0x00ffff }), // 蓝
    ]
    if (tag.position.length === 4) {
      tag.position.forEach((p, index) => {
        const material = materials[index]!
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.copy(arrayPositionToVector3(p))
        spheres.push(sphere)
      })
    } else {
      const material = materials[0]!
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.copy(arrayPositionToVector3(tag.position))
      spheres.push(sphere)
    }
    spheres.forEach((sphere) => {
      sphere.material.depthTest = false
      five.scene.add(sphere)
    })
  })
}
