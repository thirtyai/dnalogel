import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { BetterTween } from '..'
import type { Five } from '@realsee/five'
import { rangePieceImg } from '../../PanoMeasurePlugin/Modules/rangePiece/html'
import CSS3DRenderPlugin from '../../CSS3DRenderPlugin'
import type { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'

export class PointDomHelper {
  private five: Five
  private contentElement = document.createElement('div')
  private animeIns?: BetterTween<{ progress: number }>
  private container?: HTMLElement
  private css3DObject?: CSS3DObject
  private disposeCss3DObject?: () => void
  private state = { enabled: false }

  public constructor(five: Five) {
    this.five = five

    const css3DRenderPlugin = CSS3DRenderPlugin(five)
    const res = css3DRenderPlugin.create3DDomContainer(
      [
        [-0.15, 0.15, 0],
        [-0.15, -0.15, 0],
        [0.15, -0.15, 0],
        [0.15, 0.15, 0],
      ].map((item) => new THREE.Vector3().fromArray(item)),
    )
    console.log('🚀 ~ res', res)
    if (res) {
      const { container, dispose, css3DObject } = res
      this.container = container
      this.css3DObject = css3DObject
      this.disposeCss3DObject = dispose
    }
    // setTimeout(() => {
    // }, 2000)

    this.contentElement.style.width = '100%'
    this.contentElement.style.height = '100%'
    this.contentElement.style.backgroundImage = `url(${rangePieceImg})`
    this.contentElement.style.backgroundSize = '100%'
    this.contentElement.style.backgroundRepeat = 'no-repeat'
  }

  public enable() {
    if (this.state.enabled) return
    this.state.enabled = true
    this.container?.appendChild(this.contentElement)
  }

  public disable() {
    if (!this.state.enabled) return
    this.state.enabled = false
    this.contentElement.remove()
  }

  public updateWithIntersect(intersect: THREE.Intersection) {
    if (!intersect.face || !this.css3DObject) return
    const lookAtPosition = new THREE.Vector3().addVectors(intersect.point, intersect.face.normal)
    this.css3DObject.position.copy(intersect.point)
    this.css3DObject.lookAt(lookAtPosition)
    this.five.needsRender = true
  }

  /** 缩放动画 */
  public doAnimation() {
    this.animeIns?.dispose()

    // const startOpacity = 0.4
    // const endOpacity = 1

    // const startScale = 1
    // const endScale = 0.8

    new BetterTween({ progress: 0 })
      .to({ progress: [1, 0] })
      .duration(500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ progress }) => {
        // const opacity = progress * (endOpacity - startOpacity) + startOpacity
        // const scale = progress * (endScale - startScale) + startScale
      })
      .play()
  }

  public dispose() {
    this.disposeCss3DObject?.()
  }
}
