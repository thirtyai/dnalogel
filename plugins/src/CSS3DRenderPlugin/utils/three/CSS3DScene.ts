import type { Object3D } from 'three'
import * as THREE from 'three'
import getAllCSS3DObject from '../getAllCSS3DObject'

export class CSS3DFrontScene extends THREE.Scene {
  public constructor() {
    super()
  }
  public add(...objects: Object3D[]) {
    super.add(...objects)
    getAllCSS3DObject(...objects).forEach((css3DObjectPlus) => {
      css3DObjectPlus.mode = 'front'
    })
    return this
  }
}

export class CSS3DBehindScene extends THREE.Scene {
  private scene: THREE.Scene

  public constructor(scene: THREE.Scene) {
    super()
    if (!scene) throw new Error('CSS3DBehindScene: scene is required')
    this.scene = scene
  }

  public add(...objects: Object3D[]) {
    super.add(...objects)
    getAllCSS3DObject(...objects).forEach((css3DObjectPlus) => {
      css3DObjectPlus.mode = 'behind'
      this.scene.add(css3DObjectPlus.getOpacityMesh())
    })
    return this
  }

  public remove(...objects: Object3D[]) {
    getAllCSS3DObject(...objects).forEach((css3DObjectPlus) => {
      css3DObjectPlus.opacityMesh?.removeFromParent()
    })
    super.remove(...objects)
    return this
  }
}
