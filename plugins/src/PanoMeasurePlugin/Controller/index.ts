import type BaseController from './BaseController'
import type { Config } from '../typings'
import type { OpenParameter, PluginData } from '../typings/data'
import type { PanoMeasurePluginEvent } from '../typings/event.type'
import type { UserDistanceItem } from '../utils/distanceDom'
import Magnifier, { MagnifierParameter } from '../Modules/Magnifier'
import FiveHelper from '../Modules/FiveHelper'
import EditController from './EditController'
import ViewController from './ViewController'
import WatchController from './WatchController'
import MixedController from './MixedController'
import { omit } from '../../shared-utils/filter'
import { Group } from 'three'
import { Model } from '../Model'
import { Five, Subscribe } from '@realsee/five'
import { getMouseGroup } from '../utils/mouseGroup'
import { UIController } from '../Modules/UIController'
import { GuideController } from '../Modules/GuideController'
import { ShortcutKeyController } from './ShortcutKeyController'
import RangePieceController from '../Modules/rangePiece'

// 新增Mixed模式专用于mobile端
export type Mode = 'Watch' | 'Edit' | 'Mixed' | 'View'

// 参数
export interface PanoMeasureParameterType extends Partial<Config> {
  openParams?: OpenParameter
  magnifierParams?: MagnifierParameter
  useUIController?: boolean
  useGuideController?: boolean
  // TODO: 这个参数传递的太恶心了，优化一下
  userDistanceItemCreator?: () => UserDistanceItem
}

export default class MeasureController {
  public hasOpen = false
  public hook = new Subscribe<PanoMeasurePluginEvent>()
  public magnifier: Magnifier

  private five: Five
  private model: Model
  private group: Group
  private config: Config
  private fiveHelper: FiveHelper
  private useUIController?: UIController
  private params: PanoMeasureParameterType
  private useGuideController?: GuideController
  private rangePieceController?: RangePieceController
  private container = document.createElement('div')
  private shortcutKeyController?: ShortcutKeyController
  private controller: WatchController | EditController | MixedController | ViewController | null = null
  private controllerParams: ConstructorParameters<typeof BaseController>[0]

  public constructor(five: Five, params: PanoMeasureParameterType) {
    this.five = five
    this.params = params
    const defaultConfig: Config = {
      userDistanceItemCreator: undefined,
      getDistanceText(distance) {
        return distance.toFixed(2) + 'm'
      },
    }
    this.config = { ...defaultConfig, ...omit(params, ['openParams', 'magnifierParams']) }
    this.model = new Model(this.config)
    this.fiveHelper = new FiveHelper(five)
    // magnifier
    this.magnifier = new Magnifier(five, params.magnifierParams ?? { width: 190, height: 190, scale: 2 })
    // ==================== Group ====================
    this.group = new Group()
    this.group.name = 'plugin-measure-group'
    this.container.classList.add('five-plugin-measure-container')
    this.container.style.position = 'absolute'
    this.container.style.left = '0'
    this.container.style.top = '0'
    this.container.style.pointerEvents = 'none'
    this.container.style.width = '100%'
    this.container.style.height = '100%'
    this.container.style.opacity = '0'
    this.container.style.background = 'rgba(0, 0, 0, 0.15)'

    const openParams = this.params.openParams ?? {}

    this.controllerParams = {
      five: this.five,
      hook: this.hook,
      group: this.group,
      model: this.model,
      config: this.config,
      magnifier: this.magnifier,
      container: this.container,
      fiveHelper: this.fiveHelper,
      openParams,
      mouseGroup: getMouseGroup({ ...openParams.crossHairParameter }),
      userDistanceItemCreator: this.params.userDistanceItemCreator,
    }
    if (this.params.useUIController !== false) this.useUIController = new UIController(this, this.controllerParams)
    if (this.params.useGuideController !== false)
      this.useGuideController = new GuideController(this, this.controllerParams)
  }

  public appendTo(parent: HTMLElement) {
    // const intersect = new IntersectController(this.five)
    // intersect.appendTo(parent)
    parent.append(this.container)
  }

  public dispose() {
    this.disable()
    this.useUIController?.dispose()
    this.magnifier?.dispose()
    this.five.needsRender = true
  }

  /** 加载数据
   * @description 数据加载时会覆盖当前已保存的数据
   * @description 如果当前正在编辑中，会自动退出并保存编辑
   */
  public load(data: PluginData) {
    this.model.parse(data)
    this.save()
  }

  /** 插件功能入口
   * @description 会隐藏鼠标的默认聚焦环
   * @description 会隐藏当前 VR 内的点位展示
   */
  public enable(): void {
    if (this.hasOpen) return
    this.hasOpen = true
    this.five.scene.add(this.group)
    // 修改透明度
    this.container.style.opacity = '1'
    if (this.params.openParams?.isMobile) {
      this.controller = new MixedController(this.controllerParams)
      this.rangePieceController = new RangePieceController(this.controllerParams)
    } else {
      // 隐藏点位和鼠标聚焦环
      this.five.helperVisible = false
      this.controller = new WatchController(this.controllerParams)
    }
    this.useUIController?.show()
    this.useGuideController?.show()
    this.shortcutKeyController = new ShortcutKeyController(this, this.five)
    this.hook.emit('enable', true)
  }

  /** 关闭插件功能
   * @description 清除标尺线条
   * @description 还原点位展示和默认鼠标 UI
   */
  public disable(): void {
    this.hasOpen = false
    // 修改透明度
    this.container.style.opacity = '0'
    // 展示点位和鼠标聚焦环
    this.controller?.dispose()
    this.rangePieceController?.dispose()
    this.useUIController?.hide()
    this.useGuideController?.hide()
    this.shortcutKeyController?.dispose()
    this.controller = null
    this.five.helperVisible = true
    this.five.scene.remove(this.group)
    this.five.needsRender = true
    this.hook.emit('disable', true)
  }

  public getCurrentMode = (): Mode | null => {
    if (this.controller instanceof EditController) return 'Edit'
    if (this.controller instanceof WatchController) return 'Watch'
    if (this.controller instanceof MixedController) return 'Mixed'
    return null
  }

  /** 变更场景
   * @description 如果从编辑场景改变到观看场景，不会自动保存，默认丢弃所有改动
   */
  public changeMode = (mode: Mode) => {
    if (!this.hasOpen) return
    if (this.getCurrentMode() === mode) return
    // 不支持Mixed模式与其他模式切换
    if (this.getCurrentMode() === 'Mixed' || mode === 'Mixed') return new Error('不支持切换的Mode')
    this.controller?.dispose()
    const controllerMap = {
      View: ViewController,
      Watch: WatchController,
      Edit: EditController,
    }
    if (!controllerMap[mode]) throw new Error('不存在的 Mode')
    this.controller = new controllerMap[mode](this.controllerParams)
    this.hook.emit('modeChange', mode)
  }

  /** 撤销编辑 */
  public revoke(): void {
    if (!(this.controller instanceof EditController)) return
    this.controller.revoke()
    return
  }

  public removeLineByID(lineID: string) {
    this.model.removeLineByID(lineID)
  }

  /**
   * 高亮当前线段
   */
  public highlightLine(lineID: string) {
    if (this.getCurrentMode() !== 'Watch') return false
    const line = this.model.getLineByID(lineID)
    if (!line) return false
    ;(this.controller as WatchController).highlightLine(line)
    return true
  }

  public clearHighlightLines() {
    if (this.getCurrentMode() !== 'Watch') return false
    ;(this.controller as WatchController).clearHighlightLines()
    return true
  }

  /** 保存编辑 */
  public save() {
    if (!(this.controller instanceof EditController)) return this
    this.model.mergeModel(this.controller.model)
    return this
  }

  /** 把当前以保存的数据转换成 JSON 对象 */
  public toJson() {
    return this.model.toJson()
  }

  /**
   * @description 改变插件的模式（pc端模式或移动端模式）
   * @param isMobile true为移动端模式，false为pc端
   */
  public changeIsMobile(isMobile: boolean) {
    if (this.controllerParams.openParams?.isMobile === undefined) {
      this.controllerParams.openParams.isMobile = isMobile
    }
    if (this.controllerParams.openParams.isMobile === isMobile) return

    this.controllerParams.openParams.isMobile = isMobile
    if (this.params.useUIController !== false) this.useUIController?.dispose()
    this.useUIController = new UIController(this, this.controllerParams)
  }

  public changeConfigs(config: Partial<Config>) {
    if (config.getDistanceText && config.getDistanceText !== this.config.getDistanceText) {
      const getDistanceText = config.getDistanceText
      this.config.getDistanceText = getDistanceText
      this.controller?.updateDistanceUI()
    }
  }
}
