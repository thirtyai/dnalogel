import { CSS3DRender, __ELEMENT__ } from '../../../CSS3DRenderPlugin/CSS3DRender'
import * as THREE from 'three'
import { RectangleScaleHelperAbstract } from '.'
import type { Create3DElementReturnType } from '../../../CSS3DRenderPlugin'
import type { Vector3 } from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { rectangleScaleDom, backgroundDom } from './HTML/rectangleScaleDom'
import type { CSS3DObjectPlus } from '../../../CSS3DRenderPlugin/utils/CSS3DObjectPlus'
import getPoint from '../utils/getPoint'

type NonVoid<T> = T extends void ? never : T

type OriginObjectType = CSS3DObject | THREE.Object3D

export class RectangleScaleHelper<T extends OriginObjectType = OriginObjectType> extends RectangleScaleHelperAbstract<T, HTMLElement> {
  public points: RectangleScaleHelperAbstract<THREE.Object3D, HTMLElement>['points'] = []
  public cornerPositions: Vector3[] = []
  public css3DInstance?: NonVoid<Create3DElementReturnType>
  public get helperObject() {
    if (!this.css3DInstance?.css3DObject) throw new Error('css3DInstance is not initialized')
    return this.css3DInstance.css3DObject
  }
  public plane?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  private css3DRenderer = new CSS3DRender()
  private camera: THREE.Camera
  private scene: THREE.Scene
  private container: Element
  private enabled = false

  public constructor(originObject3D: T, container: Element, camera: THREE.Camera, scene: THREE.Scene) {
    super(originObject3D)
    this.camera = camera
    this.scene = scene
    this.container = container
    this.initRectangleScaleHelper()
  }

  public updatePosition() {
    this.helperObject.position.copy(this.originObject3D.position)
    this.plane?.position.copy(this.originObject3D.position)
  }

  public updateQuaternion() {
    this.plane?.quaternion.copy(this.originObject3D.quaternion)
  }

  // public setPosition(position: Vector3) {
  //   this.css3DInstance?.css3DObject.position.copy(position)
  //   this.plane?.position.copy(position)
  // }

  public applyMatrix4(matrix: THREE.Matrix4) {
    super.applyMatrix4(matrix)
    this.helperObject.applyMatrix4(matrix)
    this.plane?.applyMatrix4(matrix)
    this.cornerPositions.forEach((cornerPosition) => cornerPosition.applyMatrix4(matrix))
  }

  public showDraggingHelper() {
    // nothing to do
  }

  public applyHelperScaleMatrix4(matrix: THREE.Matrix4, params?: { origin?: Vector3; helperOrigin?: Vector3 }) {
    this.plane?.scale.applyMatrix4(matrix)
    this.helperObject.applyScaleMatrix4(matrix)
  }

  public updatePoints() {
    const position8 = this.calculatePointPosition(this.cornerPositions as [Vector3, Vector3, Vector3, Vector3])
    this.points.forEach((point, index) => {
      point.position.copy(position8[index]!)
    })
  }

  public applyHelperQuaternion(quaternion: THREE.Quaternion, origin: THREE.Vector3) {
    const css3DObject = this.css3DInstance?.css3DObject

    if (css3DObject) {
      const v = new THREE.Vector3().subVectors(css3DObject.position, origin).applyQuaternion(quaternion).add(origin)
      css3DObject.position.copy(v)
      css3DObject.applyQuaternion(quaternion)
    }

    if (this.plane) {
      const v = new THREE.Vector3().subVectors(this.plane.position, origin).applyQuaternion(quaternion).add(origin)
      this.plane.position.copy(v)
      this.plane.applyQuaternion(quaternion)
    }

    this.cornerPositions.forEach((cornerPosition) => {
      const v = new THREE.Vector3().subVectors(cornerPosition, origin).applyQuaternion(quaternion).add(origin)
      cornerPosition.copy(v)
    })
  }

  public enable() {
    if (this.enabled) return
    this.enabled = true
    this.css3DInstance?.enable()
    if (this.plane) this.scene.add(this.plane)
  }

  public disable() {
    if (!this.enabled) return
    this.enabled = false
    this.css3DInstance?.disable()
    if (this.plane) this.scene.remove(this.plane)
  }

  public show() {
    this.css3DInstance?.show()
    if (this.plane) this.plane.visible = true
  }

  public hide() {
    this.css3DInstance?.hide()
    if (this.plane) this.plane.visible = false
  }

  public dispose() {
    this.disable()
    this.css3DRenderer.dispose()
  }

  private initRectangleScaleHelper() {
    const cornerPositions = this.getCornerPositions()

    if (!cornerPositions) return

    this.cornerPositions = cornerPositions

    const css3DInstance = this.css3DRenderer.create3DElement(this.camera, cornerPositions, { ratio: 0.003 }) // ratio 暂时不用和 originObject3D 保持同步，因为本来就是不同的东西

    if (!css3DInstance) return

    this.css3DInstance = css3DInstance
    css3DInstance.appendToElement(this.container)

    // create UI
    const css3DObjectElement = css3DInstance.css3DObject.container
    const { container: dom, squares } = rectangleScaleDom()
    this.points = squares.map((square, index) => ({
      direction: square.direction,
      point: square.element,
      position: this.calculatePointPosition(cornerPositions)[index]!,
    }))

    // append html
    // css3DObjectElement.appendChild(backgroundDom())
    css3DObjectElement.insertBefore(dom, css3DObjectElement.children[0] ?? null)

    // ============================ 分割线 ============================
    const geometry = new THREE.PlaneGeometry(css3DInstance.css3DObject.width, css3DInstance.css3DObject.height)
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.15,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    this.scene.add(plane)
    // this.plane = plane

    this.updatePosition()
  }

  private getCornerPositions() {
    const { originObject3D } = this
    if (originObject3D instanceof CSS3DObject) {
      if ((originObject3D as any).isCSS3DObjectPlus) {
        const o = originObject3D as InstanceType<typeof CSS3DObjectPlus>
        return o.cornerPoints
      } else {
        console.error('暂时只支持 CSS3DRenderPlugin 生成的物体')
      }
    } else {
      console.error('当前物体暂时不支持 ScaleHelper')
    }
  }

  private calculatePointPosition(cornerPositions: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3]) {
    /**
     *  6----5----4
     *  |         |
     *  7         3
     *  |         |
     *  0----1----2
     */
    return [
      cornerPositions[0].clone(),
      cornerPositions[0].clone().add(cornerPositions[1]).divideScalar(2),
      cornerPositions[1].clone(),
      cornerPositions[1].clone().add(cornerPositions[2]).divideScalar(2),
      cornerPositions[2].clone(),
      cornerPositions[2].clone().add(cornerPositions[3]).divideScalar(2),
      cornerPositions[3].clone(),
      cornerPositions[3].clone().add(cornerPositions[0]).divideScalar(2),
    ]
  }
}
