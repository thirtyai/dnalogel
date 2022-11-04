import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { evenNumber } from './evenNumber'
import { centerPoint } from './centerPoint'
import { Subscribe } from '../../shared-utils/Subscribe'
import type * as THREE from 'three'

/**
 * @Changelog
 *  - 1.0.1: Fix rotate
 *  - 1.0.2: Add `applyScaleMatrix4` method, Rewrite `applyQuaternion` and `applyMatrix4` method
 */
const VERSION = '1.0.2'

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
  changeMode: <T extends Mode = Mode>(mode: T, prevMode: Mode, scene: T extends 'behind' ? THREE.Scene : undefined) => void
}

export class CSS3DObjectPlus<T extends HTMLElement = HTMLElement> extends CSS3DObject {
  public version = VERSION
  public width: number
  public height: number
  public domWidthPx: number
  public domHeightPx: number
  public cornerPoints: CornerPoints
  public ratio: number
  public container: T
  public centerPosition: Vector3
  public mode: 'front' | 'behind' = 'front'
  public readonly hooks: Subscribe<CSS3DRenderEventMap> = new Subscribe()
  public readonly isCSS3DObjectPlus: true = true

  // eslint-disable-next-line max-params
  public constructor(container: T, cornerPoints: CornerPoints, ratio = DefaultRatio, dpr = 1, mode: Mode = 'front') {
    const realRatio = Math.max(MinRatio, ratio)
    const planeWidth = cornerPoints[0].distanceTo(cornerPoints[1])
    const planeHeight = cornerPoints[1].distanceTo(cornerPoints[2])
    const domWidthPx = evenNumber((planeWidth / ratio) * dpr)
    const domHeightPx = evenNumber((planeHeight / ratio) * dpr)
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
    this.scale.set(realRatio, realRatio, realRatio)

    // set public property
    this.cornerPoints = cornerPoints
    this.ratio = ratio
    this.container = container
    this.mode = mode

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
  }

  public changeMode(mode: 'front'): void
  public changeMode(mode: 'behind', scene: THREE.Scene): void
  public changeMode(mode: Mode, scene?: THREE.Scene): void {
    if (mode === this.mode) return
    const prevMode = this.mode
    this.mode = mode
    this.hooks.emit('changeMode', mode, prevMode, scene)
  }

  public applyScaleMatrix4(matrix: Matrix4) {
    this.scale.applyMatrix4(matrix)
    this.hooks.emit('applyScaleMatrix4', matrix)
  }

  public applyMatrix4(matrix: Matrix4): void {
    super.applyMatrix4(matrix)
    this.hooks.emit('applyMatrix4', matrix)
  }

  public applyQuaternion(quaternion: Quaternion) {
    super.applyQuaternion(quaternion)
    this.hooks.emit('applyQuaternion', quaternion)
    return this
  }
}
