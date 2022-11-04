import * as THREE from 'three'
import type { Object3D } from 'three'
import { RotateHelperAbstract } from '../Base/BaseHelper'
import type { Color, Direction } from '../typings'
import { AXES_THREE_COLOR } from '../Constants/color'
import { tipsDom } from './HTML/tipsDom'

export class RotateHelper extends RotateHelperAbstract {
  public yzCircle = new Circle({ direction: 'x', color: AXES_THREE_COLOR.X })
  public xzCircle = new Circle({ direction: 'y', color: AXES_THREE_COLOR.Y })
  public xyCircle = new Circle({ direction: 'z', color: AXES_THREE_COLOR.Z })

  public xRingHelper = new AxesDashedRing({ direction: 'x' })
  public yRingHelper = new AxesDashedRing({ direction: 'y' })
  public zRingHelper = new AxesDashedRing({ direction: 'z' })

  public xAngleHelper = new Sector({ direction: 'x', color: AXES_THREE_COLOR.X })
  public yAngleHelper = new Sector({ direction: 'y', color: AXES_THREE_COLOR.Y })
  public zAngleHelper = new Sector({ direction: 'z', color: AXES_THREE_COLOR.Z })
  public angleTips?: ReturnType<typeof tipsDom>
  private container?: HTMLElement

  public constructor(originObject3D: Object3D, angleTipsParams?: { container: HTMLElement }) {
    super(originObject3D)

    if (angleTipsParams) {
      this.container = angleTipsParams?.container
      this.angleTips = tipsDom({ display: 'none' })
      this.container?.appendChild(this.angleTips.element)
    }
    this.show()
  }

  public updateAngleHelperQuaternion() {
    this.xAngleHelper.quaternion.copy(this.yzCircle.quaternion)
    this.yAngleHelper.quaternion.copy(this.xzCircle.quaternion)
    this.zAngleHelper.quaternion.copy(this.xyCircle.quaternion)

    this.xRingHelper.quaternion.copy(this.yzCircle.quaternion)
    this.yRingHelper.quaternion.copy(this.xzCircle.quaternion)
    this.zRingHelper.quaternion.copy(this.xyCircle.quaternion)
  }

  public applyHelperQuaternion(quaternion: THREE.Quaternion, origin?: THREE.Vector3) {
    this.yzCircle.applyQuaternion(quaternion)
    this.xzCircle.applyQuaternion(quaternion)
    this.xyCircle.applyQuaternion(quaternion)

    this.xAngleHelper.baseAxes.applyQuaternion(quaternion)
    this.yAngleHelper.baseAxes.applyQuaternion(quaternion)
    this.zAngleHelper.baseAxes.applyQuaternion(quaternion)
  }

  public hide() {
    // 改为remove而不是设置visible，是因为会影响其他helper的碰撞检测
    this.remove(
      this.yzCircle,
      this.xzCircle,
      this.xyCircle,

      this.xRingHelper,
      this.yRingHelper,
      this.zRingHelper,

      this.xAngleHelper,
      this.yAngleHelper,
      this.zAngleHelper,
    )
  }

  public show() {
    this.add(this.xyCircle, this.xzCircle, this.yzCircle)
    this.remove(this.xRingHelper, this.yRingHelper, this.zRingHelper, this.xAngleHelper, this.yAngleHelper, this.zAngleHelper)
    this.angleTips?.hide()
  }

  public showDraggingHelper(directions: Direction[]) {
    this.hide()
    this.add(...this.filterRingHelper(directions))
    this.add(...this.filterAngleHelper(directions))
    this.angleTips?.show()
  }

  public dispose() {
    this.remove(
      this.yzCircle,
      this.xzCircle,
      this.xyCircle,

      this.xRingHelper,
      this.yRingHelper,
      this.zRingHelper,

      this.xAngleHelper,
      this.yAngleHelper,
      this.zAngleHelper,
    )
    if (this.angleTips?.element) this.container?.removeChild(this.angleTips.element)
  }

  private filterRingHelper(directions: Direction[]) {
    return [this.xRingHelper, this.yRingHelper, this.zRingHelper].filter((helper) => directions.includes(helper.direction))
  }

  private filterAngleHelper(directions: Direction[]) {
    return [this.xAngleHelper, this.yAngleHelper, this.zAngleHelper].filter((helper) => directions.includes(helper.direction))
  }
}

class Circle extends THREE.Mesh {
  public direction: Direction
  public declare material: THREE.MeshBasicMaterial
  public gapAngle = 0.02
  public geometry = new THREE.RingGeometry(0.25, 0.3, 20, 8, this.gapAngle, Math.PI / 2 - this.gapAngle * 2)

  public constructor(options: { direction: Direction; color?: Color }) {
    super()

    this.material = new THREE.MeshBasicMaterial({
      opacity: 0.6,
      color: options.color ?? 0xffffff,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    })

    this.direction = options.direction

    this.geometry.name = `RotateHelperCircleGeometry-${this.direction}`

    // this.renderOrder = 20

    if (this.direction === 'y') {
      this.rotateX(Math.PI / 2)
    } else if (this.direction === 'x') {
      this.rotateY(-Math.PI / 2)
    }
  }
}

class AxesDashedRing extends THREE.Group {
  public direction: Readonly<Direction>

  public constructor(options: { direction: Direction }) {
    super()
    this.direction = options.direction

    const gapAngle = 0.015

    const meshes = new Array(8).fill(null).map((_, i) => {
      const geometry = new THREE.RingGeometry(0.25, 0.3, 20, 8, (Math.PI / 4) * i + gapAngle, Math.PI / 4 - gapAngle * 2)
      const material = new THREE.MeshBasicMaterial({
        opacity: 1,
        color: 0xffffff,
        depthTest: false,
        transparent: true,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = `AxesDashedRing-${this.direction}-${i}`
      return mesh
    })

    this.add(...meshes)

    if (this.direction === 'y') {
      this.rotateX(Math.PI / 2)
    } else if (this.direction === 'x') {
      this.rotateY(-Math.PI / 2)
    }
  }
}

class Sector extends THREE.Mesh {
  public direction: Direction
  public declare material: THREE.MeshBasicMaterial
  public baseAxes: THREE.Vector3

  public constructor(options: { direction: Direction; color?: Color }) {
    super()

    switch (options.direction) {
      case 'x':
        this.baseAxes = new THREE.Vector3(0, 0, 1)
        break
      case 'y':
        this.baseAxes = new THREE.Vector3(1, 0, 0)
        break
      case 'z':
        this.baseAxes = new THREE.Vector3(1, 0, 0)
        break
    }

    const ratio = 0.3 + 0.0005 // 挡住白色圆环的锯齿
    this.geometry = new THREE.CircleGeometry(ratio, 48, 0, 0.0001)
    this.material = new THREE.MeshBasicMaterial({
      opacity: 0.4,
      color: options.color ?? 0xffffff,
      depthTest: false,
      transparent: true,
      side: THREE.DoubleSide,
    })

    this.direction = options.direction

    // this.renderOrder = 20

    if (this.direction === 'y') {
      this.rotateX(Math.PI / 2)
    } else if (this.direction === 'x') {
      this.rotateY(-Math.PI / 2)
    }
  }
}
