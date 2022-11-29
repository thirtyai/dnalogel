import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import type * as THREE from 'three'
import getAllCSS3DObject from '../getAllCSS3DObject'
import createResizeObserver from '../createResizeObserver'

export default class ICSS3DRenderer extends CSS3DRenderer {
  public wrapper?: HTMLElement

  private requestAnimationFrameId?: number

  private resizeDisoper?: () => void

  public constructor() {
    super()
    this.domElement.style.position = 'absolute'
    this.domElement.style.top = '0'
    this.domElement.style.left = '0'
    this.domElement.style.userSelect = 'none'
    this.domElement.style.pointerEvents = 'none'
  }

  public setWrapper(wrapper: HTMLElement) {
    if (!wrapper) throw new Error('CSS3DRenderer: wrapper is required')
    if (wrapper.contains(this.domElement)) return
    const oldWrapper = this.wrapper
    if (oldWrapper) {
      if (oldWrapper.contains(this.domElement)) {
        this.domElement.remove()
      }
    }
    this.appendToElement(wrapper)
    this.wrapper = wrapper
    return this
  }

  public appendToElement(wrapper: HTMLElement) {
    wrapper.appendChild(this.domElement)
    const reSize = (width: number, height: number) => this.setSize(width, height)
    const { observe, unobserve } = createResizeObserver(wrapper, reSize, true)
    observe()
    this.resizeDisoper = unobserve
    this.wrapper = wrapper
  }

  public renderEveryFrame(scene: THREE.Scene, camera: THREE.Camera) {
    if (!this.wrapper) console.warn('wrapper is not find, creating a html element and call setWrapper(wrapper)', this, scene)
    if (this.requestAnimationFrameId) return console.warn('CSS3DRenderer: render is running')
    const _render = () => {
      this.requestAnimationFrameId = requestAnimationFrame(_render)
      if (!scene.visible) return
      if (getAllCSS3DObject(scene).length === 0) return
      this.render(scene, camera)
    }
    _render()
  }

  public stopRender() {
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId)
    }
  }

  public dispose() {
    this.stopRender()
    this.resizeDisoper?.()
    this.domElement.remove()
  }
}

export { ICSS3DRenderer }
