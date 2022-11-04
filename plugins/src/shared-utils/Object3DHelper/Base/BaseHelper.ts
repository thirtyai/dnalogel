import type { Create3DElementReturnType } from '../../../CSS3DRenderPlugin'
import type * as THREE from 'three'
import { Mesh, Object3D, Vector3 } from 'three'
import type { Direction, Direction4 } from '../typings'
import type { tipsDom } from '../Helper/HTML/tipsDom'

export abstract class BaseHelper<OriginObject3D extends Object3D = Object3D> extends Object3D {
  protected originObject3D: OriginObject3D
  protected onRender: () => any

  public get helperObject(): Object3D {
    return this
  }

  public constructor(originObject3D: OriginObject3D, config?: { onRender?: () => any }) {
    super()
    this.originObject3D = originObject3D
    this.onRender = config?.onRender ?? (() => {})
  }

  public render() {
    this.onRender()
  }

  public show() {
    this.visible = true
    this.render()
  }

  public hide() {
    this.visible = false
    this.render()
  }

  public updatePosition() {
    this.position.copy(this.originObject3D.position)
  }

  public updateQuaternion() {
    this.quaternion.copy(this.originObject3D.quaternion)
  }

  public applyHelperScaleMatrix4(matrix: THREE.Matrix4, params?: { origin?: THREE.Vector3; helperOrigin?: THREE.Vector3 }) {
    this.scale.applyMatrix4(matrix)
  }

  public applyHelperQuaternion(quaternion: THREE.Quaternion, origin?: THREE.Vector3) {
    this.applyQuaternion(quaternion)
  }

  public abstract showDraggingHelper(directions?: Direction[]): void
  public abstract dispose(): void
}

export abstract class MoveHelperAbstract<OriginObject3D extends Object3D = Object3D> extends BaseHelper<OriginObject3D> {
  public abstract xArrow?: Object3D & { arrow: Object3D; line?: Object3D; direction: Direction }
  public abstract yArrow?: Object3D & { arrow: Object3D; line?: Object3D; direction: Direction }
  public abstract zArrow?: Object3D & { arrow: Object3D; line?: Object3D; direction: Direction }
}

export abstract class RotateHelperAbstract<OriginObject3D extends Object3D = Object3D> extends BaseHelper<OriginObject3D> {
  public abstract xyCircle: Mesh & { direction: Direction }
  public abstract xzCircle: Mesh & { direction: Direction }
  public abstract yzCircle: Mesh & { direction: Direction }
  public abstract xRingHelper: Object3D
  public abstract yRingHelper: Object3D
  public abstract zRingHelper: Object3D
  public abstract xAngleHelper: Object3D & { baseAxes: Vector3; direction: Direction }
  public abstract yAngleHelper: Object3D & { baseAxes: Vector3; direction: Direction }
  public abstract zAngleHelper: Object3D & { baseAxes: Vector3; direction: Direction }
  public abstract angleTips?: ReturnType<typeof tipsDom>
  public abstract showDraggingHelper(directions: Direction[]): void
  public abstract updateAngleHelperQuaternion(): void
}

export abstract class ScaleHelperAbstract<OriginObject3D extends Object3D = Object3D> extends BaseHelper<OriginObject3D> {}

type NonVoid<T> = T extends void ? never : T

export abstract class RectangleScaleHelperAbstract<
  OriginObject3D extends Object3D,
  PointType extends Object3D | HTMLElement,
> extends ScaleHelperAbstract<OriginObject3D> {
  public abstract points: PointType extends Object3D
    ? { point: PointType; direction: Direction4 }[]
    : { point: PointType; direction: Direction4; position: Vector3 }[]
  public abstract cornerPositions: Vector3[]
  public abstract css3DInstance?: NonVoid<Create3DElementReturnType>
  public abstract plane?: THREE.Mesh
  public abstract updatePoints(): void
  public abstract enable(): void
  public abstract disable(): void
}
