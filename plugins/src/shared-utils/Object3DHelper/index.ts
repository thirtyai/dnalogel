import type { OutlineHelper } from './Helper'
import type { Object3DHelperEventMap, HelperEventMap, Object3DHelperState } from './typings'
import type { MoveController } from './Controller/MoveController'
import type { RotateController } from './Controller/RotateController'
import type { BaseController } from './Base/BaseController'
import { Subscribe } from '../Subscribe'

const VERSION = 'v1.0.1'

const NAME = 'Object3DHelper'

const NAMEVERSION = `${NAME}@${VERSION}`

const OBJECT_OPACITY = 0.4

const disposedErrorLog = () => {
  console.error(`${NAMEVERSION} is disposed`)
}

const disableWarnLog = () => {
  console.warn(`${NAMEVERSION} is disabled`)
}

const disableErrorLog = () => {
  console.error(`${NAMEVERSION} is disabled`)
}

interface Controllers {
  moveController?: MoveController
  rotateController?: RotateController
  scaleController?: BaseController
}

interface Helpers {
  outlineHelper?: OutlineHelper
}

type EventListener = {
  [K in keyof Controllers]?: () => void
}

export class Object3DHelper {
  public controllers: Controllers = {}
  public state: Object3DHelperState = {
    visible: true,
    enabled: true,
    disposed: false,
  }
  public hooks: Subscribe<Object3DHelperEventMap> = new Subscribe<Object3DHelperEventMap>()
  private helpers: Helpers
  private eventListener: EventListener = {}

  public constructor(controllers?: Controllers, helpers?: Helpers) {
    if (controllers) this.addControllers(controllers)
    this.helpers = helpers ?? {}
    this.setState(this.state)
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
    if (state.visible !== undefined) {
      this.handleVisible(state.visible)
    }
    if (state.enabled !== undefined) {
      this.handleEnable(state.enabled)
    }

    this.hooks.emit('stateChange', { state: this.state, prevState })
  }

  public addControllers(controllers: Controllers): void {
    this.controllers = { ...this.controllers, ...controllers }
    this.addEventListener()
    this.setState(this.state)
  }

  public addHelpers(helpers: Partial<{ [K in keyof Helpers]: Helpers[K] }>): void {
    this.helpers = { ...this.helpers, ...helpers }
  }

  public getCurrentState() {
    return this.state
  }

  private addEventListener() {
    for (const k in this.controllers) {
      if (!k) continue
      const key: keyof Controllers = k as keyof Controllers
      if (this.eventListener[key]) continue
      this.eventListener[key] = (() => {
        const controller = this.controllers[key]
        if (!controller) return

        const handleStart = () => this.handleStart(controller)
        const handleEnd = () => this.handleEnd(controller)
        const handlePositionUpdate = (...params: Parameters<HelperEventMap['positionUpdate']>) =>
          this.handlePositionUpdate(controller, ...params)
        const handleRotateUpdate = (...params: Parameters<HelperEventMap['rotateUpdate']>) => this.handleRotateUpdate(controller, ...params)
        const handleScaleUpdate = (...params: Parameters<HelperEventMap['scaleUpdate']>) => this.handleScaleUpdate(controller, ...params)

        controller.hooks.on('moveStart', handleStart)
        controller.hooks.on('rotateStart', handleStart)
        controller.hooks.on('scaleStart', handleStart)
        controller.hooks.on('positionUpdate', handlePositionUpdate)
        controller.hooks.on('rotateUpdate', handleRotateUpdate)
        controller.hooks.on('scaleUpdate', handleScaleUpdate)
        controller.hooks.on('moveEnd', handleEnd)
        controller.hooks.on('rotateEnd', handleEnd)
        controller.hooks.on('scaleEnd', handleEnd)

        return () => {
          controller.hooks.off('moveStart', handleStart)
          controller.hooks.off('rotateStart', handleStart)
          controller.hooks.off('scaleStart', handleStart)
          controller.hooks.off('positionUpdate', handlePositionUpdate)
          controller.hooks.off('rotateUpdate', handleRotateUpdate)
          controller.hooks.off('scaleUpdate', handleScaleUpdate)
          controller.hooks.off('moveEnd', handleEnd)
          controller.hooks.off('rotateEnd', handleEnd)
          controller.hooks.off('scaleEnd', handleEnd)
        }
      })()
    }
  }

  private handleEnd(controller: BaseController | undefined) {
    if (controller) this.setOtherHelpersVisible(true, controller)
  }

  private handleStart(controller: BaseController | undefined) {
    if (controller) this.setOtherHelpersVisible(false, controller)
  }

  private setOtherHelpersVisible(visible: boolean, currentController: BaseController) {
    if (!visible) {
      if (currentController !== this.controllers.moveController) this.controllers.moveController?.helperObject3D.hide()
      if (currentController !== this.controllers.rotateController) this.controllers.rotateController?.helperObject3D.hide()
      // if (currentController !== this.controllers.scaleController) this.controllers.scaleController?.helperObject3D.hide()
    } else {
      this.controllers.moveController?.helperObject3D.show()
      this.controllers.rotateController?.helperObject3D.show()
    }
  }

  private handlePositionUpdate = (
    controller: BaseController | undefined,
    ...positionParams: Parameters<HelperEventMap['positionUpdate']>
  ) => {
    const [position] = positionParams
    const matrix4 = position?.matrix4
    if (matrix4) {
      if (controller !== this.controllers.moveController) this.controllers.moveController?.applyHelperMatrix4(matrix4)
      if (controller !== this.controllers.rotateController) this.controllers.rotateController?.applyHelperMatrix4(matrix4)
      if (controller !== this.controllers.scaleController) this.controllers.scaleController?.applyHelperMatrix4(matrix4)
      this.helpers.outlineHelper?.applyMatrix4(matrix4)
    }
    // if (position?.position) {
    //   if (controller !== this.controllers.moveController) this.controllers.moveController?.setHelperPosition(position.position)
    //   if (controller !== this.controllers.rotateController) this.controllers.rotateController?.setHelperPosition(position.position)
    //   this.controllers.scaleController?.setHelperPosition(position.position)
    //   this.helpers.outlineHelper?.position.copy(position.position)
    // }
  }

  private handleScaleUpdate = (controller: BaseController | undefined, ...positionParams: Parameters<HelperEventMap['scaleUpdate']>) => {
    const [params] = positionParams
    const matrix4 = params?.matrix4
    if (matrix4) {
      this.controllers.scaleController?.applyHelperScaleMatrix4(matrix4, params)
      this.helpers.outlineHelper?.scale.applyMatrix4(matrix4)
    }
  }

  private handleRotateUpdate = (controller: BaseController | undefined, ...rotateParams: Parameters<HelperEventMap['rotateUpdate']>) => {
    const [rotate] = rotateParams
    if (rotate) {
      const { quaternion, origin } = rotate
      if (quaternion) {
        if (controller !== this.controllers.moveController) this.controllers.moveController?.applyHelperQuaternion(quaternion, origin)
        if (controller !== this.controllers.rotateController) this.controllers.rotateController?.applyHelperQuaternion(quaternion, origin)
        if (controller !== this.controllers.scaleController) this.controllers.scaleController?.applyHelperQuaternion(quaternion, origin)
        this.helpers.outlineHelper?.applyQuaternion(quaternion)
      }
    }
  }

  private handleEnable(enabled: boolean, userAction = true) {
    if (enabled) {
      this.everyControllerDo((controller) => {
        controller.enable()
        // controller.setOpacity(OBJECT_OPACITY)
      })
      this.hooks.emit('enable', { userAction })
    } else {
      this.everyControllerDo((controller) => {
        controller.disable()
        controller.restoreOpacity()
      })
      this.hooks.emit('disable', { userAction })
    }
    this.state.enabled = enabled
  }

  private handleVisible(visible: boolean, userAction = true) {
    if (visible) {
      this.everyControllerDo((controller) => {
        controller.show()
        // controller.setOpacity(OBJECT_OPACITY)
      })
      this.actionIfStateIsEnabled(() => this.hooks.emit('show', { userAction }))
    } else {
      this.everyControllerDo((controller) => {
        controller.hide()
        controller.restoreOpacity()
      })
      this.actionIfStateIsEnabled(() => this.hooks.emit('hide', { userAction }))
    }
    this.state.visible = visible
  }

  private everyControllerDo(func: (controller: BaseController) => any) {
    Object.values(this.controllers).forEach((controller: BaseController | undefined) => {
      if (controller) func(controller)
    })
  }

  private handleDispose() {
    Object.values(this.controllers).forEach((controller: BaseController | undefined) => {
      controller?.dispose()
      controller?.restoreOpacity()
    })

    for (const k in this.controllers) {
      if (!k) continue
      const key: keyof Controllers = k as keyof Controllers
      this.eventListener[key]?.()
    }
  }

  private actionIfStateIsEnabled<T = any>(func: () => T, options?: { warnLog?: true }) {
    if (this.state.enabled) return func()
    else {
      if (options?.warnLog) disableWarnLog()
    }
  }
}
