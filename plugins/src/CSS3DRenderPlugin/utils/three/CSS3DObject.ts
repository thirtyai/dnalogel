import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { even } from '../even'
import { centerPoint } from '../centerPoint'
import { Subscribe } from '../../../shared-utils/Subscribe'
import OpacityMesh from './OpacityMesh'
import type { CSS3DGroup } from './CSS3DGroup'

/**
 * @changelog
 *  - 1: Fix rotate
 *  - 0: Add `applyScaleMatrix4` method, Rewrite `applyQuaternion` and `applyMatrix4` method
 */
const VERSION = 1

const NAME = `CSS3DObjectPlus@${VERSION}`

export const MinRatio = 0.00216

export const DefaultRatio = 0.003

export type Mode = 'front' | 'behind'

export type CornerPoints = [Vector3, Vector3, Vector3, Vector3]

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CSS3DRenderEventMap = {
  applyMatrix4: (matrix: Matrix4) => void
  applyQuaternion: (quaternion: Quaternion) => void
  applyScaleMatrix4: (matrix: Matrix4) => void
}

export class CSS3DObjectPlus<T extends HTMLElement = HTMLElement> extends CSS3DObject {
  public version = VERSION
  public readonly isCSS3DObjectPlus: true = true

  public container: T
  public width: number
  public height: number
  public domWidthPx: number
  public domHeightPx: number
  public cornerPoints: CornerPoints
  public centerPosition: Vector3
  public ratio: number
  public mode: 'front' | 'behind' = 'front'

  public readonly hooks: Subscribe<CSS3DRenderEventMap> = new Subscribe()

  public opacityMesh?: OpacityMesh

  private selfVisible = true

  private parentVisibleListenerDisposer?: () => void

  public constructor(params: {
    container: T
    mode?: 'front' | 'behind'
    cornerPoints: CornerPoints
    ratio?: number
    dpr?: number
    pointerEvents?: 'none' | 'auto'
  }) {
    const container = params.container
    const cornerPoints = params.cornerPoints
    const ratio = params.ratio ?? DefaultRatio
    const dpr = params.dpr ?? 1
    const pointerEvents = params.pointerEvents ?? 'auto'

    const realRatio = Math.max(MinRatio, ratio)
    const planeWidth = cornerPoints[0].distanceTo(cornerPoints[1])
    const planeHeight = cornerPoints[1].distanceTo(cornerPoints[2])
    const domWidthPx = even((planeWidth / ratio) * dpr)
    const domHeightPx = even((planeHeight / ratio) * dpr)
    const centerPosition = centerPoint(...cornerPoints)

    let css3DObjectElement: HTMLElement

    if (realRatio === ratio) {
      container.style.width = `${domWidthPx}px`
      container.style.height = `${domHeightPx}px`

      css3DObjectElement = container
    } else {
      // 兼容ratio小于0.00216的情况
      const element = document.createElement('div')
      element.style.width = `${domWidthPx}px`
      element.style.height = `${domHeightPx}px`
      element.style.pointerEvents = 'none'

      const scale = ratio / realRatio
      container.style.position = 'absolute'
      container.style.left = '0'
      container.style.top = '0'
      container.style.width = `${scale * domWidthPx}px`
      container.style.height = `${scale * domHeightPx}px`
      element.appendChild(container)

      css3DObjectElement = element
    }

    super(css3DObjectElement)

    // 注意设置pointerEvents要在super之后，否则会被覆盖
    container.style.pointerEvents = pointerEvents

    this.scale.set(realRatio, realRatio, realRatio)

    // set public property
    this.cornerPoints = cornerPoints
    this.ratio = ratio
    this.container = container
    if (params.mode) this.mode = params.mode

    if (realRatio === ratio) {
      this.width = planeWidth
      this.height = planeHeight
      this.domWidthPx = domWidthPx
      this.domHeightPx = domHeightPx
      this.centerPosition = centerPosition
    } else {
      const scale = ratio / realRatio

      this.width = scale * planeWidth
      this.height = scale * planeHeight
      this.domWidthPx = scale * domWidthPx
      this.domHeightPx = scale * domHeightPx
      this.centerPosition = new Vector3().subVectors(centerPosition, cornerPoints[0]).multiplyScalar(scale).add(cornerPoints[0])
    }
    // end

    container.classList.add(`${NAME}__container`)

    const targetVector01 = new Vector3().subVectors(cornerPoints[1], cornerPoints[0]) // 点0 -> 点1 的向量
    const targetVector03 = new Vector3().subVectors(cornerPoints[3], cornerPoints[0]) // 点0 -> 点3 的向量

    // 旋转法向量
    const targetNormal = new Vector3().crossVectors(targetVector01, targetVector03).normalize() // 旋转后的法向量
    this.lookAt(targetNormal)

    // 绕法向量旋转
    const up = this.up.clone().applyQuaternion(this.quaternion)
    const targetUp = targetVector03.clone()
    const rotateAxis = new Vector3().crossVectors(up, targetUp).normalize() // 计算旋转轴
    this.rotateOnWorldAxis(rotateAxis, up.angleTo(targetUp))

    // set position
    this.position.copy(centerPosition)

    // listener

    this.addEventListener('added', () => {
      if (this.mode === 'front') this.opacityMesh?.removeFromParent()
      this.addParentVisibleListener()
    })

    this.addEventListener('removed', () => {
      this.opacityMesh?.removeFromParent()
      this.removeParentVisibleListener()
    })
  }

  public setVisible(visible: boolean, params: { setSelfVisible: boolean } = { setSelfVisible: true }) {
    if (params.setSelfVisible) this.selfVisible = visible
    this.visible = visible
    if (this.opacityMesh) this.opacityMesh.visible = visible
  }

  public removeFromParent() {
    const parent = this.parent
    if (parent !== null) {
      parent.remove(this)
    }
    this.opacityMesh?.removeFromParent()
    return this
  }

  public removeOpacityMesh() {
    this.opacityMesh?.removeFromParent()
    this.opacityMesh = undefined
    return this
  }

  public dispose() {
    this.container.remove()
    this.removeFromParent()
    this.opacityMesh?.removeFromParent()
  }

  public getOpacityMesh() {
    if (this.opacityMesh) return this.opacityMesh
    else {
      const opacityMesh = this.createOpacityMesh(this)
      this.opacityMesh = opacityMesh
      return opacityMesh
    }
  }

  public applyMatrix4(matrix: Matrix4): void {
    super.applyMatrix4(matrix)
    this.opacityMesh?.applyMatrix4(matrix)
  }

  public applyQuaternion(quaternion: Quaternion) {
    super.applyQuaternion(quaternion)
    this.opacityMesh?.applyQuaternion(quaternion)
    return this
  }

  public applyScaleMatrix4(matrix: Matrix4) {
    this.scale.applyMatrix4(matrix)
    this.opacityMesh?.scale.applyMatrix4(matrix)
  }

  /**
   * @description: 生成透明Mesh
   */
  private createOpacityMesh = (css3DObject: CSS3DObjectPlus) => {
    const { domWidthPx, domHeightPx } = css3DObject
    const mesh = new OpacityMesh(domWidthPx, domHeightPx)
    mesh.position.copy(css3DObject.position)
    mesh.rotation.copy(css3DObject.rotation)
    mesh.scale.copy(css3DObject.scale)
    return mesh
  }

  private addParentVisibleListener = () => {
    if ((this.parent as any)?.isCSS3DGroup) {
      const parent = this.parent as CSS3DGroup
      const handler = (parentVisible: boolean) => {
        this.setVisible(parentVisible && this.selfVisible, { setSelfVisible: false })
      }
      parent.hooks.on('visibleChange', handler)
      this.parentVisibleListenerDisposer = () => parent.hooks.off('visibleChange', handler)
    }
  }

  private removeParentVisibleListener = () => {
    this.parentVisibleListenerDisposer?.()
  }
}
