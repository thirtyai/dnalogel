import * as THREE from 'three'
import type { Five } from '@realsee/five'
import { Subscribe } from '@realsee/five'
import { Magnifier, PointHelper, PointDomHelper } from '.'

interface FivePointSelectorOptions {
  magnifier: Magnifier | null
  pointHelper: PointHelper | null
  pointDomHelper: PointDomHelper | null
}

type FivePointSelectorEventMap = {
  /** 点的位置发生变化 */
  pointChanged: (data: { panoIndex: number; position: number[]; normal: number[] | undefined }) => void
  /** 功能开启 */
  enabled: () => void
  /** 功能关闭 */
  disabled: () => void
} & {}

export class FivePointSelector {
  public five: Five
  public hooks = new Subscribe<FivePointSelectorEventMap>()
  private magnifier: Magnifier | null = null
  private pointHelper: PointHelper | null = null
  private pointDomHelper: PointDomHelper | null = null
  private contentDom = document.createElement('div')
  private state = { enabled: false }
  private group = new THREE.Group()

  public constructor(five: Five, options?: Partial<FivePointSelectorOptions>) {
    this.five = five

    this.magnifier = options?.magnifier === undefined ? new Magnifier(five, { dragEnabled: true }) : null
    this.pointHelper = options?.pointHelper === undefined ? new PointHelper() : null
    this.pointDomHelper = options?.pointDomHelper === undefined ? new PointDomHelper(five) : null

    this.group.name = 'five-point-selector'
    this.five.scene.add(this.group)

    this.contentDom.classList.add('five-point-selector-content')
    this.contentDom.style.position = 'absolute'
    this.contentDom.style.top = '0'
    this.contentDom.style.left = '0'
    this.contentDom.style.width = '100%'
    this.contentDom.style.height = '100%'
    this.contentDom.style.pointerEvents = 'none'
  }

  public enable() {
    if (this.state.enabled) return
    this.state.enabled = true
    if (this.pointHelper) {
      this.group.add(this.pointHelper)
    }
    this.magnifier?.enable()
    this.pointDomHelper?.enable()
    this.five.needsRender = true
    this.hooks.emit('enabled')
  }

  public disable() {
    if (!this.state.enabled) return
    this.state.enabled = false
    if (this.pointHelper) {
      this.group.remove(this.pointHelper)
    }
    this.magnifier?.disable()
    this.pointDomHelper?.disable()
    this.hooks.emit('disabled')
  }

  public dispose() {
    this.hooks.off()
    this.disable()
    this.magnifier = null
    this.pointHelper = null
    this.pointDomHelper = null
  }

  public updateWithIntersect(intersect: THREE.Intersection) {
    this.hooks.emit('pointChanged', {
      panoIndex: this.five.getCurrentState().panoIndex,
      position: intersect.point.toArray(),
      normal: intersect.face?.normal.toArray(),
    })
    // update magnifier
    const magnifier = this.magnifier
    if (magnifier) {
      magnifier.renderWithPoint(intersect.point)
    }
    // update pointer helper
    const pointHelper = this.pointHelper
    if (pointHelper) {
      pointHelper.updateWithIntersect(intersect)
    }
    // update pointer dom helper
    const pointDomHelper = this.pointDomHelper
    if (pointDomHelper) {
      // pointDomHelper.updateWithIntersect(intersect)
      // this.five.render()
      // pointHelper!.updateWorldMatrix(true, false)
      // pointDomHelper.updateWithModelViewMatrix(pointHelper!.modelViewMatrix)
      pointDomHelper.updateWithIntersect(intersect)
    }
    this.five.needsRender = true
  }
}
