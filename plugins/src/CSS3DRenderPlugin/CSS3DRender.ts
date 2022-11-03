import * as THREE from 'three'
import type { Vector3 } from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import type { Merge } from 'type-fest'
import { Subscribe } from '../shared-utils/Subscribe'
import { AnyPosition, anyPositionToVector3, evenNumber } from './utils'
import { CSS3DObjectPlus, Mode } from './utils/CSS3DObjectPlus'
export { MinRatio } from './utils/CSS3DObjectPlus'

const VERSION = 'v2.0.1'

const PLUGIN_NAME = 'CSS3DRenderer'

export const __ELEMENT__ = '__CSS3DOBJECT_CSS3DRENDER_CONTAINER__'

export const PLUGIN = `${PLUGIN_NAME}@${VERSION}`

const pluginFlag = (name: string) => `${PLUGIN}--${name}`

export interface CSS3DRenderState {
  enabled: boolean
  visible: boolean
  disposed: boolean
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CSS3DRenderEventMap = {
  show: (options?: { userAction?: boolean }) => void
  hide: (options?: { userAction?: boolean }) => void
  enable: (options?: { userAction?: boolean }) => void
  disable: (options?: { userAction?: boolean }) => void
  dispose: () => void
  /**
   * 插件状态变化
   * @param params.state      最新的State
   * @param params.prevState  上一个State
   * @param params.userAction 是否是用户触发
   */
  stateChange: (params: { state: CSS3DRenderState; prevState?: CSS3DRenderState; userAction: boolean }) => void
}

export interface Create3DDElementParamsType {
  points: AnyPosition[]
  config?: {
    ratio?: number
    devicePixelRatio?: number
    autoRender?: boolean
    container?: HTMLElement
    pointerEvents?: 'none' | 'auto'
    scene?: THREE.Scene
  } & ({ mode?: 'front' } | { mode: 'behind'; scene: THREE.Scene })
}

export const globalStore: {
  frontModeResizeObserver?: {
    observe: () => void
    unobserve: () => void
  }
  behindModeResizeObserver?: {
    observe: () => void
    unobserve: () => void
  }
  frontModeContainer?: Element
  behindModeContainer?: Element
  frontModeStore?: {
    css3DScene: THREE.Scene
    css3DRenderer: CSS3DRenderer
    requestAnimationFrameId?: number
    appendedToPage?: boolean
  }
  behindModeStore?: {
    scene: THREE.Scene
    css3DScene: THREE.Scene
    css3DRenderer: CSS3DRenderer
    requestAnimationFrameId?: number
    appendedToPage?: boolean
  }
} = {}

export class CSS3DRender {
  public hooks: Subscribe<CSS3DRenderEventMap> = new Subscribe()

  public state: CSS3DRenderState = {
    enabled: true,
    visible: true,
    disposed: false,
  }

  private store: {
    rendered: boolean
    disposers: (() => any)[]

    frontModeCSS3DObjects: Record<
      string,
      {
        mode: 'front'
        css3DObject: CSS3DObjectPlus
        visible: boolean
        enabled: boolean
        opacityMesh?: THREE.Mesh
      }
    >
    behindModeCSS3DObjects: Record<
      string,
      {
        mode: 'behind'
        css3DObject: CSS3DObjectPlus
        visible: boolean
        enabled: boolean
        opacityMesh: THREE.Mesh
        scene: THREE.Scene
      }
    >
  } = {
    rendered: false,
    disposers: [],
    frontModeCSS3DObjects: {},
    behindModeCSS3DObjects: {},
  }

  public getCurrentState() {
    return this.state
  }

  public setState(state: Partial<CSS3DRenderState>, options: { userAction: boolean } = { userAction: true }) {
    if (this.state.disposed) return this.disposedErrorLog()
    const prevState = { ...this.state }
    this.state = Object.assign(this.state, state)
    if (prevState.visible !== this.state.visible) {
      state.visible ? this.handleShow() : this.handleHide()
    }
    if (prevState.enabled !== this.state.enabled) {
      state.enabled ? this.handleEnable() : this.handleDisable()
    }
    this.hooks.emit('stateChange', { state: this.state, prevState, userAction: options.userAction })
  }

  public dispose() {
    this.store.disposers.forEach((d) => d?.())
    this.store.disposers = []
    this.hooks.emit('dispose')
    this.state.disposed = true
  }

  public async show({ userAction } = { userAction: true }) {
    if (this.state.disposed) return this.disposedErrorLog()
    this.setState({ visible: true }, { userAction })
    this.hooks.emit('show', { userAction })
  }

  public async hide({ userAction } = { userAction: true }) {
    if (this.state.disposed) return this.disposedErrorLog()
    this.setState({ visible: false }, { userAction })
    this.hooks.emit('hide', { userAction })
  }

  public enable({ userAction } = { userAction: true }) {
    if (this.state.disposed) return this.disposedErrorLog()
    this.setState({ enabled: true }, { userAction })
    this.hooks.emit('enable', { userAction })
  }

  public disable({ userAction } = { userAction: true }) {
    if (this.state.disposed) return this.disposedErrorLog()
    this.setState({ enabled: false }, { userAction })
    this.hooks.emit('disable', { userAction })
  }

  /**
   * @description 根据传入的四个点位创建一个 3d dom容器，可以通过ReactDom.render()的方式将react组件放到容器中
   * @param { Vector3Position[] } points 矩形四个点坐标
   * @param config 均为可选值
   * @config_document `config` 均为可选值
   *  | key                   | type                       | defaultValue        | comment |
   *  | -                     | -                          | -                   | -       |
   *  | `ratio`               | *`number`*                 | `0.00216`           | 1px对应多少米，默认为 0.00216，即1px对应2.16mm |
   *  | `devicePixelRatio`    | *`number`*                 | `1`                 | 设备的物理像素分辨率与CSS像素分辨率的比值 |
   *  | `container`           | *`HTMLElement`*            | `undefined`         | 自定义 return 中的 `container`
   *  | `pointerEvents`       | *`'none'\|'auto'`*         | `'none'`            | container 的 css属性：`pointer-events` 的值 |
   *  | `autoRender`          | *`boolean`*                | `true`              | 是否自动渲染，通常为true |
   *  | `mode`                | *`'front'\|'behind'`*      | `front`             | 两种模式:|
   *  |                                                                          | | | `front`  模式：DOM 处于 five Canvas 上方，所以无法模拟遮挡效果，需要手动检测是否可见去设置显隐 |
   *  |                                                                          | | | `behind` 模式：DOM 处于 five Canvas 下方，可以模拟真实的遮挡效果，但是 DOM 必须是非透明的 |
   *  | `scene`               | *`THREE.Scene`*            | `undefined`         | 如果 mode 为 `behind`，需要传入 |
   *
   * @return
   * ```typescript
   *    {
   *      id: string,                             // id
   *      container: HTMLDIVElement               // dom容器
   *      dispose: () => void                     // 销毁
   *      css3DObject: CSS3DObject                // THREE.CSS3DObject 实例
   *      render?: () => void                     // 渲染函数，当 config.autoRender = true || undefined 时为 undefined
   *      setVisible: (visible: boolean) => void  // 设置显隐, 同 setVisibleById(id, visible)
   *      show: () => void                        // 同 setVisible(true)
   *      hide: () => void                        // 同 setVisible(false)
   *      setEnabled: (enabled: boolean) => void   // 添加/移除 container, 同 setEnabledById(id, enabled)
   *      enable: () => void                      // 同 setEnabled(true)
   *      disable: () => void                     // 同 setEnabled(false)
   *    } | void
   * ```
   */
  public create3DElement = (
    camera: THREE.Camera,
    points: Create3DDElementParamsType['points'],
    config?: Create3DDElementParamsType['config'],
  ) => {
    if (this.state.disposed) return this.disposedErrorLog()
    // ==== init ====
    const mergeConfig = (() => {
      const defaultConfig = {
        ratio: 0.00216,
        devicePixelRatio: 1,
        mode: 'front',
        autoRender: true,
        container: document.createElement('div'),
        pointerEvents: 'none',
      }
      return Object.assign(defaultConfig, config) as Merge<typeof defaultConfig, typeof config>
    })()

    const vector3Points = points.map(anyPositionToVector3) as [Vector3, Vector3, Vector3, Vector3]
    if (vector3Points?.length < 4) return console.error(`${PLUGIN}: requires 4 point but params may have fewer`)

    const { ratio, devicePixelRatio: dpr, mode, autoRender, container, pointerEvents } = mergeConfig
    const disposers: (() => any)[] = []
    // ==== init END ====

    // 获取css3DObject, 如果mode为behind的话，也一起获取mesh
    const { css3DObject, opacityMesh } = this.createObject(vector3Points, { ratio, dpr, container, mode, pointerEvents })
    container.id = `container--${css3DObject.uuid}`

    const frontModeAndFrontModeUnInited = mode === 'front' && !globalStore.frontModeStore
    const behindModeAndBehindModeUnInited = mode === 'behind' && !globalStore.behindModeStore
    if (mode === 'front') this.initGlobalModeStore('front')
    if (mode === 'behind') this.initGlobalModeStore('behind', mergeConfig.scene)

    // change mode 监听
    css3DObject.hooks.on('changeMode', (mode, prevMode, scene) => {
      if (mode === prevMode) return

      if (mode === 'front') this.initGlobalModeStore('front')
      if (mode === 'behind') this.initGlobalModeStore('behind', scene!)
      const prevGlobalModeStore = prevMode === 'front' ? globalStore.frontModeStore : globalStore.behindModeStore
      const nextGlobalModeStore = mode === 'front' ? globalStore.frontModeStore : globalStore.behindModeStore
      const prevObjects = prevMode === 'behind' ? this.store.behindModeCSS3DObjects : this.store.frontModeCSS3DObjects
      const nextObjects = mode === 'behind' ? this.store.behindModeCSS3DObjects : this.store.frontModeCSS3DObjects

      if (!prevObjects || !nextObjects) return console.error(`${PLUGIN}: changeMode error: prevObjects or nextObjects is undefined`)
      const prevObject = prevObjects[css3DObject.uuid]
      if (!prevObject) return console.error(`${PLUGIN}: changeMode error: prevObject is undefined`)

      // if (!autoRender && !this.store.rendered) return console.warn(`autoRender is ${autoRender}, please call render() manually`)
      if (mode === 'behind') {
        const opacityMesh = prevObject.opacityMesh ?? this.createOpacityMesh(prevObject.css3DObject)
        prevGlobalModeStore?.css3DScene.remove(prevObject.css3DObject)
        nextObjects[css3DObject.uuid] = { css3DObject, opacityMesh, visible: true, enabled: true, mode, scene: scene! }
        nextGlobalModeStore?.css3DScene.add(css3DObject)
        scene?.add(opacityMesh)
      }
      if (mode === 'front') {
        prevGlobalModeStore?.css3DScene.remove(prevObject.css3DObject)
        ;(prevObjects[css3DObject.uuid] as any | undefined)?.scene?.remove(prevObject.opacityMesh)
        nextObjects[css3DObject.uuid] = { css3DObject, visible: true, enabled: true, mode }
        nextGlobalModeStore?.css3DScene.add(css3DObject)
      }
      if (mode === 'behind') this.appendToElement(globalStore.behindModeContainer, 'behind')
      if (mode === 'front') this.appendToElement(globalStore.frontModeContainer, 'front')
      this.render(camera)
      console.log('change success')
    })

    const modeStore = mode === 'front' ? globalStore.frontModeStore! : globalStore.behindModeStore!
    const { css3DScene, css3DRenderer } = modeStore
    const render = (() => {
      const renderCSS3DObject = () => {
        const mode = css3DObject.mode
        if (mode === 'front') {
          this.store.frontModeCSS3DObjects[css3DObject.uuid] = {
            visible: true,
            enabled: true,
            css3DObject,
            mode: 'front',
          }
        } else {
          if (!mergeConfig.scene) return
          this.store.behindModeCSS3DObjects[css3DObject.uuid] = {
            visible: true,
            enabled: true,
            css3DObject,
            opacityMesh: opacityMesh!,
            mode: 'behind',
            scene: mergeConfig.scene,
          }
        }
        if (!css3DScene.getObjectById(css3DObject.id)) {
          css3DScene.add(css3DObject)
        }
        if (mode === 'behind' && opacityMesh) {
          if (!mergeConfig.scene?.getObjectById(opacityMesh.id)) {
            mergeConfig.scene?.add(opacityMesh)
          }
          disposers.push(() => opacityMesh && mergeConfig.scene?.remove(opacityMesh))
        }
      }
      if (frontModeAndFrontModeUnInited || behindModeAndBehindModeUnInited) {
        css3DRenderer.domElement.style.position = 'absolute'
        css3DRenderer.domElement.style.top = '0'
        css3DRenderer.domElement.style.userSelect = 'none'
        css3DRenderer.domElement.style.pointerEvents = 'none'
        css3DRenderer.domElement.classList.add(pluginFlag(mode))
        return () => {
          renderCSS3DObject()
          this.render(camera)
        }
      }
      this.store.rendered = true
      return () => renderCSS3DObject()
    })()

    const wrapper = mode === 'front' ? globalStore.frontModeContainer : globalStore.behindModeContainer
    if (wrapper) {
      this.appendToElement(wrapper, mode)
      const store = mode === 'front' ? globalStore.frontModeStore : globalStore.behindModeStore
      if (store) store.appendedToPage = true
    }

    const setVisible = (visible: boolean) => this.setVisibleById(css3DObject.uuid, visible)

    const setEnabled = (enabled: boolean) => this.setEnabledById(css3DObject.uuid, enabled)

    const show = () => setVisible(true)

    const hide = () => setVisible(false)

    const enable = () => setEnabled(true)

    const disable = () => setEnabled(false)

    const dispose = () => {
      delete this.store.frontModeCSS3DObjects[css3DObject.uuid]
      delete this.store.behindModeCSS3DObjects[css3DObject.uuid]
      disposers.forEach((d) => d?.())
      css3DScene.remove(css3DObject)
      // 如果全没了，就清除父容器
      if (css3DScene.children.length === 0) {
        if (typeof modeStore.requestAnimationFrameId === 'number') {
          cancelAnimationFrame(modeStore.requestAnimationFrameId)
        }
        css3DRenderer.domElement.remove()
        if (mode === 'front') globalStore.frontModeStore = undefined
        if (mode === 'behind') globalStore.behindModeStore = undefined
        globalStore.frontModeResizeObserver = undefined
        globalStore.behindModeResizeObserver = undefined
      }
      return true
    }
    this.store.disposers.push(dispose)
    if (autoRender) render()
    return {
      id: css3DObject.uuid,
      container,
      dispose,
      css3DObject,
      render: autoRender ? undefined : render,
      show,
      hide,
      setVisible,
      disable,
      enable,
      setEnabled,
      appendToElement: (container: Element) => this.appendToElement(container, mode),
    }
  }

  public setContainer(container: Element, mode: Mode) {
    if (mode === 'front') {
      globalStore.frontModeContainer = container
    } else {
      globalStore.behindModeContainer = container
    }
  }

  public appendToElement(container: Element | undefined, mode: Mode) {
    const store = mode === 'front' ? globalStore.frontModeStore : globalStore.behindModeStore
    if (!store) {
      if (mode === 'front' && !globalStore.frontModeContainer) {
        if (!container) throw new Error(`${PLUGIN} Cannot append to container: front mode but container is ${container}`)
        globalStore.frontModeContainer = container
      }
      if (mode === 'behind' && !globalStore.behindModeContainer) {
        if (!container) throw new Error(`${PLUGIN} Cannot append to container: behind mode but container is ${container}`)
        globalStore.behindModeContainer = container
      }
      return
    }
    if (store.appendedToPage) return

    const wrapper = mode === 'behind' ? globalStore.behindModeContainer : globalStore.frontModeContainer

    if (!wrapper) return console.error('wrapper is undefined')

    wrapper.appendChild(store.css3DRenderer.domElement)

    if (mode === 'behind' && !globalStore.behindModeResizeObserver) {
      const reSize = (width: number, height: number) => {
        globalStore.behindModeStore?.css3DRenderer.setSize(width, height)
      }
      const { observe, unobserve } = this.createResizeObserver(wrapper, reSize, true)
      globalStore.behindModeResizeObserver = { observe, unobserve }
      observe()
      this.store.disposers.push(unobserve)
    }

    if (mode === 'front' && !globalStore.frontModeResizeObserver) {
      const reSize = (width: number, height: number) => {
        globalStore.frontModeStore?.css3DRenderer.setSize(width, height)
      }
      const { observe, unobserve } = this.createResizeObserver(wrapper, reSize, true)
      globalStore.frontModeResizeObserver = { observe, unobserve }
      observe()
      this.store.disposers.push(unobserve)
    }

    store.appendedToPage = true
  }

  public setVisibleById = (id: string, visible: boolean) => {
    const data = this.store.frontModeCSS3DObjects[id] ?? this.store.behindModeCSS3DObjects[id]
    if (!data) return console.error('id not found', id)
    data.visible = visible
    if (this.state.visible) {
      data.css3DObject.visible = visible
      if (data.mode === 'behind') data.opacityMesh.visible = visible
    }
  }

  public setEnabledById = (id: string, enabled: boolean) => {
    const data = this.store.frontModeCSS3DObjects[id] ?? this.store.behindModeCSS3DObjects[id]
    if (!data) return
    const css3DScene = data.mode === 'front' ? globalStore.frontModeStore?.css3DScene : globalStore.behindModeStore?.css3DScene
    if (!css3DScene) return
    if (enabled) {
      css3DScene.add(data.css3DObject)
      if (data.mode === 'behind') data.scene.add(data.opacityMesh)
    } else {
      css3DScene.remove(data.css3DObject)
      if (data.mode === 'behind') data.scene.remove(data.opacityMesh)
    }
    data.enabled = enabled
  }

  private render(camera: THREE.Camera) {
    const behindModeStore = globalStore.behindModeStore
    const frontModeStore = globalStore.frontModeStore

    if (behindModeStore && Object.keys(this.store.behindModeCSS3DObjects).length > 0 && !behindModeStore.requestAnimationFrameId) {
      const renderBehindMode = () => {
        const requestAnimationFrameId = requestAnimationFrame(renderBehindMode)
        behindModeStore.requestAnimationFrameId = requestAnimationFrameId
        behindModeStore.css3DRenderer.render(behindModeStore.css3DScene, camera)
      }
      renderBehindMode()
    }
    if (frontModeStore && Object.keys(this.store.frontModeCSS3DObjects).length > 0 && !frontModeStore.requestAnimationFrameId) {
      const renderFrontMode = () => {
        const requestAnimationFrameId = requestAnimationFrame(renderFrontMode)
        frontModeStore.requestAnimationFrameId = requestAnimationFrameId
        frontModeStore.css3DRenderer.render(frontModeStore.css3DScene, camera)
      }
      renderFrontMode()
    }
    if (Object.keys(this.store.frontModeCSS3DObjects).length === 0) {
      if (frontModeStore?.requestAnimationFrameId !== undefined) {
        cancelAnimationFrame(frontModeStore.requestAnimationFrameId)
        frontModeStore.requestAnimationFrameId = undefined
      }
    }
    if (Object.keys(this.store.behindModeCSS3DObjects).length === 0) {
      if (behindModeStore?.requestAnimationFrameId !== undefined) {
        cancelAnimationFrame(behindModeStore.requestAnimationFrameId)
        behindModeStore.requestAnimationFrameId = undefined
      }
    }
  }

  private createObject = (
    points: [Vector3, Vector3, Vector3, Vector3],
    config: {
      ratio: number
      dpr: number
      container: HTMLElement
      pointerEvents: 'none' | 'auto'
      mode: 'front' | 'behind'
    },
  ) => {
    const { ratio, dpr, container, mode, pointerEvents } = config

    const css3DObject = new CSS3DObjectPlus(container, points, ratio, dpr, mode)
    container.style.pointerEvents = pointerEvents
    container.classList.add(`${PLUGIN_NAME}__container`)
    const opacityMesh = mode === 'behind' ? this.createOpacityMesh(css3DObject) : undefined
    return { css3DObject, opacityMesh }
  }

  private initGlobalModeStore(mode: 'front'): void
  private initGlobalModeStore(mode: 'behind', scene: THREE.Scene): void
  private initGlobalModeStore(mode: Mode, scene?: THREE.Scene) {
    const frontModeAndFrontModeUnInited = mode === 'front' && !globalStore.frontModeStore
    const behindModeAndBehindModeUnInited = mode === 'behind' && !globalStore.behindModeStore
    if (behindModeAndBehindModeUnInited) {
      globalStore.behindModeStore = { scene: scene!, css3DScene: new THREE.Scene(), css3DRenderer: new CSS3DRenderer() }
    }
    if (frontModeAndFrontModeUnInited) {
      globalStore.frontModeStore = { css3DScene: new THREE.Scene(), css3DRenderer: new CSS3DRenderer() }
    }
  }

  /**
   * @description: 生成透明Mesh
   */
  private createOpacityMesh = (css3DObject: CSS3DObjectPlus) => {
    const { domWidthPx, domHeightPx } = css3DObject
    const material = new THREE.MeshBasicMaterial({
      opacity: 0,
      color: 0x000000,
      transparent: false,
      side: THREE.DoubleSide,
    })
    const geometry = new THREE.PlaneGeometry(domWidthPx, domHeightPx)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = pluginFlag('mesh')
    mesh.position.copy(css3DObject.position)
    mesh.rotation.copy(css3DObject.rotation)
    mesh.scale.copy(css3DObject.scale)
    css3DObject.hooks.on('applyMatrix4', (matrix) => mesh.applyMatrix4(matrix))
    css3DObject.hooks.on('applyQuaternion', (quaternion) => mesh.applyQuaternion(quaternion))
    css3DObject.hooks.on('applyScaleMatrix4', (matrix) => mesh.scale.applyMatrix4(matrix))
    return mesh
  }

  private async handleShow() {
    Object.values(this.store.frontModeCSS3DObjects).forEach((value) => {
      value.css3DObject.visible = value.visible
    })

    Object.values(this.store.behindModeCSS3DObjects).forEach((value) => {
      value.css3DObject.visible = value.visible
      value.opacityMesh.visible = value.visible
    })
  }

  private async handleHide() {
    Object.values(this.store.frontModeCSS3DObjects).forEach((value) => {
      value.css3DObject.visible = false
    })
    Object.values(this.store.behindModeCSS3DObjects).forEach((value) => {
      value.css3DObject.visible = false
      value.opacityMesh.visible = false
    })
  }

  private handleEnable() {
    Object.values(this.store.frontModeCSS3DObjects).forEach((value) => {
      if (!value.enabled) return
      globalStore.frontModeStore?.css3DScene.add(value.css3DObject)
    })
    Object.values(this.store.behindModeCSS3DObjects).forEach((value) => {
      if (!value.enabled) return
      globalStore.behindModeStore?.css3DScene.add(value.css3DObject)
      globalStore.behindModeStore?.scene.add(value.opacityMesh)
    })
  }

  private handleDisable() {
    Object.values(this.store.frontModeCSS3DObjects).forEach((value) => {
      globalStore.frontModeStore?.css3DScene.remove(value.css3DObject)
    })
    Object.values(this.store.behindModeCSS3DObjects).forEach((value) => {
      globalStore.behindModeStore?.css3DScene.remove(value.css3DObject)
      globalStore.behindModeStore?.scene.remove(value.opacityMesh)
    })
  }

  private createResizeObserver = (element: Element, resizeHandler: (width: number, height: number) => any, fireImmediately = true) => {
    if (!element) {
      console.error('createResizeObserver: element is undefined')
      return { observe: () => {}, unobserve: () => {} }
    }

    const resizeObserverHandler = () => {
      /**
       * 这里evenNumber策略是遇到奇数会加1，在某些浏览器中会触发滚动条显示，导致fiveElement变小，fiveElement变小又触发了这里的resize，宽高变小，滚动条消失，然后又触发resize。。。无限循环
       * 所以为了规避上面这种情况，evenNumber设置了一个参数，遇到奇数可选择减一
       */
      const width = evenNumber(element.clientWidth, { smaller: true })
      const height = evenNumber(element.clientHeight, { smaller: true })
      resizeHandler(width, height)
    }

    if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
      console.warn('createResizeObserver: ResizeObserver is undefined')
      return { observe: () => resizeObserverHandler(), unobserve: () => {} }
    }

    const observer = new ResizeObserver(resizeObserverHandler)
    if (fireImmediately) resizeObserverHandler()
    return {
      observe: () => observer.observe(element),
      unobserve: () => observer.unobserve(element),
    }
  }

  private disposedErrorLog = () => {
    console.error(`${PLUGIN} is disposed`)
  }
}
