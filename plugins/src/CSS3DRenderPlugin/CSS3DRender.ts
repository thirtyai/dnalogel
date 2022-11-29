import type * as THREE from 'three'
import type { Vector3 } from 'three'
import { ICSS3DRenderer as CSS3DRenderer } from './utils/three/CSS3DRenderer'
import type { Merge } from 'type-fest'
import { Subscribe } from '../shared-utils/Subscribe'
import { AnyPosition, anyPositionToVector3 } from './utils'
import { CSS3DObjectPlus } from './utils/three/CSS3DObject'
import { CSS3DBehindScene, CSS3DFrontScene } from './utils/three/CSS3DScene'
import { CSS3DBehindGroup, CSS3DFrontGroup } from './utils/three/CSS3DGroup'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
export { MinRatio } from './utils/three/CSS3DObject'

/**
 * @changelog
 *  - v3: 重构
 */
const VERSION = 3

const PLUGIN_NAME = 'CSS3DRenderer'

export const PLUGIN = `${PLUGIN_NAME}@${VERSION}`

const disposedErrorLog = () => {
  console.error(`${PLUGIN} is disposed`)
}

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
  css3DObjects: CSS3DObjectPlus[]
  frontModeStore: {
    css3DScene?: CSS3DFrontScene
    css3DRenderer: CSS3DRenderer
    container?: HTMLElement
  }
  behindModeStore: {
    css3DScene?: CSS3DBehindScene
    css3DRenderer: CSS3DRenderer
    container?: HTMLElement
    scene?: THREE.Scene
  }
} = {
  css3DObjects: [],
  frontModeStore: {
    css3DRenderer: new CSS3DRenderer(),
  },
  behindModeStore: {
    css3DRenderer: new CSS3DRenderer(),
  },
}

function getCSS3DObjectById(id: number) {
  return globalStore.css3DObjects.find((c) => c.id === id)
}

function setFrontModeContainer(container: HTMLElement) {
  globalStore.frontModeStore.css3DRenderer.setWrapper(container)
}
function setBehindModeContainer(container: HTMLElement) {
  globalStore.behindModeStore.css3DRenderer.setWrapper(container)
}

export class CSS3DRender {
  public static setFrontModeContainer = setFrontModeContainer

  public static setBehindModeContainer = setBehindModeContainer

  public hooks: Subscribe<CSS3DRenderEventMap> = new Subscribe()

  public state: CSS3DRenderState = {
    enabled: true,
    visible: true,
    disposed: false,
  }

  public get scene() {
    if (!this._scene) console.error("scene doesn't exist!, please call setScene(scene) first")
    return this._scene
  }

  private _scene?: THREE.Scene

  private store: {
    frontModeGroup: THREE.Group
    behindModeGroup?: THREE.Group
  } = {
    frontModeGroup: new CSS3DFrontGroup(),
  }

  public static get frontModeCSS3DRenderer() {
    return globalStore.frontModeStore.css3DRenderer
  }

  public static get behindModeCSS3DRenderer() {
    return globalStore.behindModeStore.css3DRenderer
  }

  public get frontModeCSS3DRenderer() {
    return globalStore.frontModeStore.css3DRenderer
  }

  public get behindModeCSS3DRenderer() {
    return globalStore.behindModeStore.css3DRenderer
  }

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  public constructor(scene?: THREE.Scene) {
    if (scene) this.setScene(scene)
  }

  public setScene(scene: THREE.Scene) {
    this._scene = scene
  }

  public getCurrentState() {
    return this.state
  }

  public setState(state: Partial<CSS3DRenderState>, options: { userAction: boolean } = { userAction: true }) {
    if (this.state.disposed) return disposedErrorLog()
    const prevState = { ...this.state }
    this.state = Object.assign(this.state, state)
    if (prevState.visible !== this.state.visible) {
      state.visible ? this.handleShow() : this.handleHide()
    }
    if (prevState.enabled !== this.state.enabled) {
      state.enabled ? this.handleEnable() : this.handleDisable()
    }
    if (prevState.disposed !== this.state.disposed) {
      this.handleDispose()
    }
    this.hooks.emit('stateChange', { state: this.state, prevState, userAction: options.userAction })
  }

  public dispose() {
    this.setState({ disposed: true })
    this.hooks.emit('dispose')
  }

  public async show({ userAction } = { userAction: true }) {
    if (this.state.disposed) return disposedErrorLog()
    this.setState({ visible: true }, { userAction })
    this.hooks.emit('show', { userAction })
  }

  public async hide({ userAction } = { userAction: true }) {
    if (this.state.disposed) return disposedErrorLog()
    this.setState({ visible: false }, { userAction })
    this.hooks.emit('hide', { userAction })
  }

  public enable({ userAction } = { userAction: true }) {
    if (this.state.disposed) return disposedErrorLog()
    this.setState({ enabled: true }, { userAction })
    this.hooks.emit('enable', { userAction })
  }

  public disable({ userAction } = { userAction: true }) {
    if (this.state.disposed) return disposedErrorLog()
    this.setState({ enabled: false }, { userAction })
    this.hooks.emit('disable', { userAction })
  }

  /**
   * @description 根据传入的四个点位创建一个 3d dom容器，可以通过ReactDom.render()的方式将react组件放到容器中
   * @param { Vector3Position[] } points 矩形四个点坐标
   * @param params 均为可选值
   * @config_document `params` 均为可选值
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
    params?: Create3DDElementParamsType['config'],
  ) => {
    if (this.state.disposed) return disposedErrorLog()
    // ==== init ====
    const config = (() => {
      const defaultConfig = {
        ratio: 0.00216,
        devicePixelRatio: 1,
        mode: 'front',
        autoRender: true,
        container: document.createElement('div'),
        pointerEvents: 'none',
      }
      return Object.assign(defaultConfig, params) as Merge<typeof defaultConfig, typeof params>
    })()

    const vector3Points = points.map(anyPositionToVector3) as [Vector3, Vector3, Vector3, Vector3]
    if (vector3Points?.length < 4) return console.error(`${PLUGIN}: requires 4 point but params may have fewer`)

    const { ratio, devicePixelRatio: dpr, mode, autoRender, container, pointerEvents } = config
    // ==== init END ====

    const css3DObject = this.createObject(vector3Points, { ratio, dpr, container, mode, pointerEvents })

    globalStore.css3DObjects.push(css3DObject)

    if (config.scene) this.setScene(config.scene)

    const renderCSS3DObject = () => {
      const group = css3DObject.mode === 'front' ? this.getFrontCSS3DObjectGroup() : this.getBehindCSS3DObjectGroup()
      if (!group) return
      group.add(css3DObject)
    }

    const render = () => {
      renderCSS3DObject()
      this.render(camera)
    }

    const setVisible = (visible: boolean) => this.setVisibleById(css3DObject.id, visible)
    const setEnabled = (enabled: boolean) => this.setEnabledById(css3DObject.id, enabled)
    const dispose = () => {
      css3DObject.removeFromParent()
      return true
    }

    const css3DRenderer = mode === 'front' ? globalStore.frontModeStore.css3DRenderer : globalStore.behindModeStore.css3DRenderer

    if (autoRender) render()

    return {
      id: css3DObject.uuid,
      container,
      css3DObject,
      render: autoRender ? undefined : render,
      show: () => setVisible(true),
      hide: () => setVisible(false),
      setVisible,
      enable: () => setEnabled(true),
      disable: () => setEnabled(false),
      setEnabled,
      dispose,
      appendToElement: (element: HTMLElement) => css3DRenderer.setWrapper(element),
    }
  }

  public getFrontCSS3DScene({ createSceneIfNotExists = false } = {}) {
    const css3DScene = globalStore.frontModeStore?.css3DScene
    if (css3DScene) return css3DScene
    else {
      // not exists
      if (createSceneIfNotExists) {
        const css3DFrontScene = new CSS3DFrontScene()
        globalStore.frontModeStore.css3DScene = css3DFrontScene
      }
      return globalStore.frontModeStore.css3DScene
    }
  }

  public getBehindCSS3DScene({ createSceneIfNotExists = false } = {}) {
    const css3DScene = globalStore.behindModeStore?.css3DScene
    if (css3DScene) return css3DScene
    else {
      // not exists
      if (createSceneIfNotExists) {
        const s = globalStore.behindModeStore.scene ?? this.scene
        if (!s) {
          console.error(`${PLUGIN}: scene is required when mode is behind`)
          return
        }
        const css3DBehindScene = new CSS3DBehindScene(s)
        globalStore.behindModeStore.css3DScene = css3DBehindScene
        globalStore.behindModeStore.scene = s
      }
      return globalStore.behindModeStore.css3DScene
    }
  }

  public getFrontCSS3DObjectGroup({ addGroupIfNotExists = true } = {}) {
    const css3DScene = this.getFrontCSS3DScene({ createSceneIfNotExists: addGroupIfNotExists })
    if (addGroupIfNotExists && css3DScene) {
      if (!css3DScene.getObjectById(this.store.frontModeGroup.id)) {
        css3DScene.add(this.store.frontModeGroup)
      }
    }
    return this.store.frontModeGroup
  }

  public getBehindCSS3DObjectGroup({ addGroupIfNotExists = true } = {}) {
    const css3DScene = this.getBehindCSS3DScene({ createSceneIfNotExists: addGroupIfNotExists })
    if (addGroupIfNotExists && css3DScene && this.scene) {
      const behindModeGroup = this.store.behindModeGroup ?? new CSS3DBehindGroup(this.scene)
      this.store.behindModeGroup = behindModeGroup
      if (!css3DScene.getObjectById(behindModeGroup.id)) css3DScene.add(behindModeGroup)
    }
    return this.store.behindModeGroup
  }

  public setVisibleById = (id: number, visible: boolean) => {
    getCSS3DObjectById(id)?.setVisible(visible)
  }

  public setEnabledById = (id: number, enabled: boolean) => {
    const css3DObject = getCSS3DObjectById(id)
    if (!css3DObject) return
    const group =
      css3DObject.mode === 'front'
        ? this.getFrontCSS3DObjectGroup({ addGroupIfNotExists: false })
        : this.getBehindCSS3DObjectGroup({ addGroupIfNotExists: false })
    if (!group) return
    if (enabled) {
      group.add(css3DObject)
    } else {
      group.remove(css3DObject)
    }
  }

  public render(camera: THREE.Camera) {
    if (this.getFrontCSS3DObjectGroup({ addGroupIfNotExists: false }).children.length > 0) {
      const css3DScene = this.getFrontCSS3DScene({ createSceneIfNotExists: true })
      if (!css3DScene) return console.error(`${PLUGIN}: css3DScene is required when mode is front`)
      globalStore.frontModeStore.css3DRenderer.renderEveryFrame(css3DScene, camera)
    }
    if ((this.getBehindCSS3DObjectGroup({ addGroupIfNotExists: false })?.children.length ?? 0) > 0) {
      const css3DScene = this.getBehindCSS3DScene({ createSceneIfNotExists: true })
      if (!css3DScene) return console.error(`${PLUGIN}: css3DScene is required when mode is behind`)
      globalStore.behindModeStore.css3DRenderer.renderEveryFrame(css3DScene, camera)
    }
  }

  private createObject = (
    points: [Vector3, Vector3, Vector3, Vector3],
    config: { ratio: number; dpr: number; container: HTMLElement; pointerEvents: 'none' | 'auto'; mode: 'front' | 'behind' },
  ) => {
    const css3DObject = new CSS3DObjectPlus({ cornerPoints: points, ...config })
    css3DObject.element.classList.add(`${PLUGIN_NAME}__container`)
    css3DObject.element.id = `${PLUGIN_NAME}__container--${css3DObject.uuid}`
    return css3DObject
  }

  private async handleShow() {
    this.store.frontModeGroup.visible = true
    if (this.store.behindModeGroup) this.store.behindModeGroup.visible = true
  }

  private async handleHide() {
    this.store.frontModeGroup.visible = false
    if (this.store.behindModeGroup) this.store.behindModeGroup.visible = false
  }

  private handleEnable() {
    this.getFrontCSS3DScene()?.add(this.store.frontModeGroup)
    if (this.store.behindModeGroup) this.getBehindCSS3DScene()?.add(this.store.behindModeGroup)
  }

  private handleDisable() {
    this.store.frontModeGroup.children.forEach((object) => {
      if (object instanceof CSS3DObject && object.element instanceof Element && object.element.parentNode !== null) {
        object.element.parentNode.removeChild(object.element)
      }
    })
    this.store.behindModeGroup?.children.forEach((object) => {
      if (object instanceof CSS3DObject && object.element instanceof Element && object.element.parentNode !== null) {
        object.element.parentNode.removeChild(object.element)
      }
    })
    this.getFrontCSS3DScene()?.remove(this.store.frontModeGroup)
    if (this.store.behindModeGroup) this.getBehindCSS3DScene()?.remove(this.store.behindModeGroup)
  }

  private handleDispose() {
    this.handleDisable()
  }
}
