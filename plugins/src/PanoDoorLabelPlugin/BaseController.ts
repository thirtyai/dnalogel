import { Five, Mode } from '@realsee/five'
import { BaseOptions, Controller, EventMap, State } from '../base/BasePlugin'

/**
 * pano plugin controller 基类
 * @author kyleju
 */
export abstract class BasePanoPluginController<
  T extends State,
  E extends EventMap<T>,
> extends Controller<T, E> {
  public state: T
  public container: Element
  public enabled: boolean

  public constructor(five: Five) {
    super(five)
    this.five = five
    this.five.once('dispose', this.dispose)
    this.enabled = true
    this.state = this.initState()
  }

  /**
   * 启用组件
   * @param options
   */
  public enable(options?: BaseOptions): void {
    this.enabled = true
    this.updateState({ ...options, userAction: true })
  }

  /**
   * 禁用组件
   * @param options
   */
  public disable(options?: BaseOptions): void {
    this.enabled = false
    this.updateState({ ...options, userAction: true })
  }

  /**
   * 显示 UI
   * @param options
   * @returns
   */
  public show(options?: BaseOptions): Promise<void> {
    if (!this.state.enabled) return
    this.setState({ ...this.state, visible: true }, options)
    return Promise.resolve()
  }

  /**
   * 隐藏 UI
   * @param options
   * @returns
   */
  public hide(options: BaseOptions): Promise<void> {
    if (!this.state.enabled) return
    this.setState({ ...this.state, visible: false }, options)
    return Promise.resolve()
  }

  /**
   * 销毁对象
   */
  public dispose(): void {
    this.container.remove()
  }

  /**
   * 设置状态
   * @param state @T 状态
   * @param options @BaseOptions 可选配置
   * @returns
   */
  public setState(state: Partial<T>, options?: BaseOptions): void {
    if (!this.enabled) return
    const prevState = { ...this.state }
    this.state = { ...this.state, ...state, ...options }
    this.stateChangedCallback(prevState, options)
  }

  public get visible() {
    return this.five.state.mode === Five.Mode.Panorama
  }

  public appendTo(container: Element) {
    if (!this.enabled) return
    this.container = container
    this.render()
  }

  private updateState(options: BaseOptions) {
    this.setState({ ...this.state, enabled: this.enabled, visible: this.visible }, options)
  }

  /**
   * 组件 渲染
   */
  public abstract render()

  /**
   * State 初始化
   */
  public abstract initState(): T

  /**
   * State 改变回调
   */
  public abstract stateChangedCallback(prevState: T, options?: BaseOptions)
}
