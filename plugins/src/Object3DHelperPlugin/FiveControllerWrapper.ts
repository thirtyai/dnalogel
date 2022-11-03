/**
 * @description: 将手势操作绑定到controller上
 */
import type { Five, EventCallback } from '@realsee/five'
import type { BaseController } from '../shared-utils/Object3DHelper/Base/BaseController'
import type * as THREE from 'three'
import type { BaseHelper } from '../shared-utils/Object3DHelper/Helper'

class ControllerWrapper<Helper extends BaseHelper = BaseHelper, Controller extends BaseController = BaseController<Helper>> {
  public helperController?: Controller
  private five: Five

  public constructor(
    five: Five,
    HelperController: new (...params: ConstructorParameters<typeof BaseController<Helper>>) => Controller,
    object: THREE.Object3D,
    helperObjects: Helper,
  ) {
    const { camera, model, scene } = five
    const container = five.getElement()
    this.five = five
    if (!camera || !model || !container || !scene) return
    const needsRender = () => {
      five.needsRender = true
    }
    // TODO: 是否要改为绑定
    this.helperController = new HelperController(camera, model, object, helperObjects, container, scene, needsRender)
    five.on('wantsTapGesture', this.onFiveWantsTapGesture)
    five.on('wantsGesture', this.onFiveWantsGesture)
  }

  private onFiveWantsTapGesture: EventCallback['wantsTapGesture'] = (params) => {
    if (!this.helperController) return
    const result = this.helperController.onWantsTapGesture(params)
    this.five.needsRender = true
    return result
  }

  private onFiveWantsGesture: EventCallback['wantsGesture'] = (...params) => {
    if (!this.helperController) return
    const result = this.helperController.onWantsGesture(...params)
    this.five.needsRender = true
    return result
  }
}

const controllerWrapper = <Helper extends BaseHelper = BaseHelper, Controller extends BaseController = BaseController<Helper>>(
  ...params: ConstructorParameters<typeof ControllerWrapper<Helper, Controller>>
) => new ControllerWrapper<Helper, Controller>(...params)

export { ControllerWrapper }
export { controllerWrapper }
export { ControllerWrapper as FiveControllerWrapper }
export { controllerWrapper as fiveControllerWrapper }
