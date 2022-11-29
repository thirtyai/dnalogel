import * as THREE from 'three'
import { Subscribe } from '../../../shared-utils/Subscribe'
import type { Object3D } from 'three'
import getAllCSS3DObject from '../getAllCSS3DObject'
import type { Mode } from './CSS3DObject'

export class CSS3DGroup extends THREE.Group {
  public readonly isCSS3DGroup = true

  public mode: Mode

  public CSS3DObjectLength = 0

  public hooks: Subscribe<{ visibleChange: (visible: boolean) => void }> = new Subscribe()

  public constructor(mode: Mode) {
    super()
    this.mode = mode
  }

  public add(...objects: Object3D[]) {
    getAllCSS3DObject(...objects).forEach((css3DObjectPlus) => {
      css3DObjectPlus.mode = this.mode
    })
    super.add(...objects)
    this.updateLength()
    return this
  }

  public setVisible(visible: boolean) {
    this.visible = visible
    this.hooks.emit('visibleChange', visible)
  }

  public remove(...objects: Object3D[]) {
    super.remove(...objects)
    this.updateLength()
    return this
  }

  private updateLength() {
    this.CSS3DObjectLength = getAllCSS3DObject(this).length
  }
}

export class CSS3DFrontGroup extends CSS3DGroup {
  public constructor() {
    super('front')
  }
}

export class CSS3DBehindGroup extends CSS3DGroup {
  private scene: THREE.Scene

  public constructor(scene: THREE.Scene) {
    super('behind')
    if (!scene) throw new Error('CSS3DBehindScene: scene is required')
    this.scene = scene
  }

  public add(...objects: Object3D[]) {
    getAllCSS3DObject(...objects).forEach((css3DObjectPlus) => {
      this.scene.add(css3DObjectPlus.getOpacityMesh())
    })
    super.add(...objects)
    return this
  }
}
