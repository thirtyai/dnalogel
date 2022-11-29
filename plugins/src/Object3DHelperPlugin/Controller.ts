import type { Five } from '@realsee/five'
import * as BasePlugin from '../base/BasePlugin'
import { MoveHelper, RotateHelper, RectangleScaleHelper } from '../shared-utils/Object3DHelper/Helper'
import type * as THREE from 'three'
import { MoveController } from '../shared-utils/Object3DHelper/Controller/MoveController'
import type { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { FiveControllerWrapper } from './FiveControllerWrapper'
import { Object3DHelper } from '../shared-utils/Object3DHelper'
import { RotateController } from '../shared-utils/Object3DHelper/Controller/RotateController'
import { CSS3DScaleController } from '../shared-utils/Object3DHelper/Controller/CSS3DScaleController'
import type { Object3DHelperState } from '../shared-utils/Object3DHelper/typings'
import type { Object3DHelperPluginEventMap, Object3DHelperPluginState } from './typings'
import type { CSS3DObjectPlus } from '../CSS3DRenderPlugin/utils/three/CSS3DObject'
import { CSS3DRender } from '../CSS3DRenderPlugin/CSS3DRender'
import fiveModelLoaded from '../CSS3DRenderPlugin/utils/waitFiveModelLoaded'
import generateBehindFiveElement from '../CSS3DRenderPlugin/utils/generateBehindFiveElement'

export const VERSION = 'v1.0.0'

const PLUGIN_NAME = 'Object3DHelperPlugin'

export const PLUGIN = `${PLUGIN_NAME}@${VERSION}`

const disposedErrorLog = () => {
  console.error(`${PLUGIN} is disposed`)
}

const disableWarnLog = () => {
  console.warn(`${PLUGIN} is disabled`)
}

const disableErrorLog = () => {
  console.error(`${PLUGIN} is disabled`)
}

export class Object3DHelperController extends BasePlugin.Controller<Object3DHelperPluginState, Object3DHelperPluginEventMap> {
  public version = VERSION
  public name = PLUGIN_NAME
  public state: Object3DHelperState = {
    visible: true,
    enabled: true,
    disposed: false,
  }

  public objectHelperMap: Map<THREE.Object3D, Object3DHelper> = new Map()

  private css3DObjectParentMap: Map<THREE.Object3D, THREE.Object3D | null> = new Map()

  private css3DRender: CSS3DRender

  public constructor(five: Five) {
    super(five)
    this.five = five
    this.css3DRender = new CSS3DRender(this.five.scene)

    console.warn('Object3DHelper: 使用此插件需要在初始化five时，设置five参数: { backgroundAlpha: 0, backgroundColor: 0x000000 }')
    Object.assign(window, { [`__${PLUGIN_NAME.toUpperCase()}_DEBUG__`]: this })
    // Object.assign(window, { THREE: THREE })
  }

  /**
   * @description Show guide line
   */
  public async show(options?: { userAction?: boolean }) {
    this.setState({ visible: true }, options)
  }

  /**
   * @description Hide guide line
   */
  public async hide(options?: { userAction?: boolean }) {
    this.setState({ visible: false }, options)
  }

  /**
   * @description Enable
   */
  public enable(options?: { userAction?: boolean }) {
    this.setState({ enabled: true }, options)
  }

  /**
   * @description Disable
   */
  public disable(options?: { userAction?: boolean }) {
    this.setState({ enabled: false }, options)
  }

  /**
   * @description Dispose
   */
  public dispose() {
    this.setState({ disposed: true })
  }

  public setState(state: Partial<Object3DHelperState>, options?: { userAction?: boolean } & Record<string, any>): void {
    if (this.state.disposed) return disposedErrorLog()
    if (!this.state.enabled) {
      // when plugin is disabled, only can change enabled or disposed to true
      if (state.enabled !== true && state.disposed !== true) return disableErrorLog()
    }
    const prevState = { ...this.state }
    this.state = { ...this.state, ...state }
    if (state.disposed !== undefined && state.disposed !== prevState.disposed) {
      if (state.disposed) this.handleDispose()
    }
    if (state.visible !== undefined && state.visible !== prevState.visible) {
      this.handleVisible(state.visible)
    }
    if (state.enabled !== undefined && state.enabled !== prevState.enabled) {
      this.handleEnable(state.enabled)
    }

    this.hooks.emit('stateChange', { state: this.state, prevState })
  }

  public getObject3DHelper(object3D: THREE.Object3D) {
    return this.objectHelperMap.get(object3D)
  }

  /**
   * @description 添加 helper
   * @param { THREE.Object3D } object3D       要添加helper的物体
   * @param { boolean } config.moveHelper     位移helper
   * @param { boolean } config.rotateHelper   旋转helper
   * @param { boolean } config.scaleHelper    缩放helper
   */
  public addObject3DHelper(object3D: THREE.Object3D, config: { moveHelper?: boolean; rotateHelper?: boolean; scaleHelper?: boolean } = {}) {
    if (!object3D) return console.error('Object3D is undefined')
    if (this.objectHelperMap.has(object3D)) {
      console.warn(`Object3DHelperPlugin: object3D ${object3D.name} is already has helper`)
      return
    }
    const helper = new Object3DHelper()
    this.objectHelperMap.set(object3D, helper)

    const container = this.five.getElement()?.parentElement
    const camera = this.five.camera
    // 创建空的helperGroup
    // merge config
    const { moveHelper = true, rotateHelper = true, scaleHelper = true } = config

    // 筛选
    if (moveHelper) {
      const moveHelper = new MoveHelper(object3D)
      const controllerWrapper = new FiveControllerWrapper(this.five, MoveController, object3D, moveHelper)
      helper.addControllers({ moveController: controllerWrapper.helperController })
    }
    if (rotateHelper) {
      let angleTipsParams
      if (container && camera) angleTipsParams = { container }
      const rotateHelper = new RotateHelper(object3D, angleTipsParams)
      const controllerWrapper = new FiveControllerWrapper(this.five, RotateController, object3D, rotateHelper)
      helper.addControllers({ rotateController: controllerWrapper.helperController })
    }
    if (scaleHelper) {
      if (container) {
        const scaleHelper = new RectangleScaleHelper<CSS3DObject>(object3D as CSS3DObject, container, camera, this.five.scene)
        const controllerWrapper = new FiveControllerWrapper(this.five, CSS3DScaleController, object3D, scaleHelper)
        helper.addControllers({ scaleController: controllerWrapper.helperController })
      }
    }
    if ((object3D as any).isCSS3DObjectPlus) {
      fiveModelLoaded(this.five).then(() => {
        const css3DObject = object3D as CSS3DObjectPlus
        const wrapper = this.css3DRender.behindModeCSS3DRenderer.wrapper ?? generateBehindFiveElement(this.five)
        if (wrapper) {
          // 移除
          this.css3DObjectParentMap.set(css3DObject, css3DObject.parent)
          css3DObject.removeFromParent()
          // 添加
          this.css3DRender.behindModeCSS3DRenderer.setWrapper(wrapper)
          this.css3DRender.getBehindCSS3DObjectGroup()?.add(css3DObject)
          this.css3DRender.render(this.five.camera)
        }
      })
    }
    // if (mergeConfig.outlineHelper) {
    //   const outlineHelper = new OutlineHelper(object3D)
    //   helperGroup.add(outlineHelper)
    //   this.totalController.addHelpers({ outlineHelper })
    // }
    // this.five.scene.add(helperGroup)
  }

  public removeObject3DHelper(object3D: THREE.Object3D) {
    const helper = this.objectHelperMap.get(object3D)
    if (!helper) return
    if ((object3D as any).isCSS3DObjectPlus) {
      const css3DObject = object3D as CSS3DObjectPlus
      const parent = this.css3DObjectParentMap.get(css3DObject)
      parent?.add(css3DObject)
      this.css3DRender.render(this.five.camera)
      // ;(object3D as CSS3DObjectPlus).changeMode('front')
    }
    this.objectHelperMap.delete(object3D)
    helper.dispose()
  }

  private handleEnable(enabled: boolean, userAction = true) {
    if (enabled) {
      this.everyHelperDo((helper) => helper.enable())
      this.hooks.emit('enable', { userAction })
    } else {
      this.everyHelperDo((helper) => helper.disable())
      this.hooks.emit('disable', { userAction })
    }
    this.state.enabled = enabled
  }

  private handleVisible(visible: boolean, userAction = true) {
    if (visible) {
      this.everyHelperDo((helper) => helper.show())
      this.actionIfStateIsEnabled(() => this.hooks.emit('show', { userAction }))
    } else {
      this.everyHelperDo((helper) => helper.hide())
      this.actionIfStateIsEnabled(() => this.hooks.emit('hide', { userAction }))
    }
    this.state.visible = visible
  }

  private handleDispose() {
    this.everyHelperDo((helper) => helper.dispose())
  }

  private everyHelperDo(func: (helper: Object3DHelper) => any) {
    this.objectHelperMap.forEach((helper) => {
      if (helper) func(helper)
    })
  }

  private actionIfStateIsEnabled<T = any>(func: () => T, options?: { warnLog?: true }) {
    if (this.state.enabled) return func()
    else {
      if (options?.warnLog) disableWarnLog()
    }
  }
}
