import * as THREE from 'three'

export default class OpecityMesh extends THREE.Mesh {
  public name = 'opacity-mesh'

  public constructor(width: number, height: number) {
    const material = new THREE.MeshBasicMaterial({ opacity: 0, color: 0x000000, transparent: false, side: THREE.DoubleSide })
    const geometry = new THREE.PlaneGeometry(width, height)
    super(geometry, material)
  }

  public removeFromParent() {
    const parent = this.parent

    if (parent !== null) {
      parent.remove(this)
    }

    return this
  }
}
