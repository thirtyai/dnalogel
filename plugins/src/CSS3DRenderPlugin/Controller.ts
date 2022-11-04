import type * as BasePlugin from '../base/BasePlugin'
import type * as THREE from 'three'
import type { Five } from '@realsee/five'
import { CSS3DRender, CSS3DRenderEventMap, CSS3DRenderState } from './CSS3DRender'
import type { AnyPosition } from './utils'

const VERSION = 'v2.0.1'

export const PLUGIN_NAME = `CSS3DRenderPlugin@${VERSION}`

export interface Create3DDomContainerParamsType {
  points: AnyPosition[]
  config?: {
    ratio?: number
    /** @deprecated dpr renamed as devicePixelRatio */
    dpr?: number
    devicePixelRatio?: number
    autoRender?: boolean
    container?: HTMLElement
    pointerEvents?: 'none' | 'auto'
  } & ({ mode?: 'front' } | { mode: 'behind'; behindFiveContainer: HTMLElement })
}

export default class Controller extends CSS3DRender implements BasePlugin.Controller<CSS3DRenderState, CSS3DRenderEventMap> {
  public five: Five
  public behindFiveContainer?: HTMLElement

  public readonly staticPrefix: string = '//vrlab-static.ljcdn.com'

  public constructor(five: Five) {
    super()
    this.five = five
  }

  /** @deprecated disposeAll() renamed as dispose() */
  public disposeAll() {
    return this.dispose()
  }

  public setState(...params: Parameters<InstanceType<typeof CSS3DRender>['setState']>): void {
    const result = super.setState(...params)
    this.five.needsRender = true
    return result
  }

  /**
   * @description 根据传入的四个点位创建一个 3d dom容器，可以通过ReactDom.render()的方式将react组件放到容器中
   * @param { Vector3Position[] } points 矩形四个点坐标
   * @param config 均为可选值
   * @config_document `config` 均为可选值
   *  | key                   | type                       | defaultValue        | comment |
   *  | -                     | -                          | -                   | -       |
   *  | `ratio`               | *`number`*                 | `0.00216`           | 1px对应多少米，默认为 0.00216，即1px对应2.16mm |
   *  | ~~`dpr`~~             | ~~*`number`*~~             | ~~`undefined`~~     | ~~**已改名**，请使用~~ `devicePixelRatio` |
   *  | `devicePixelRatio`    | *`number`*                 | `1`                 | 设备的物理像素分辨率与CSS像素分辨率的比值 |
   *  | `container`           | *`HTMLElement`*            | `undefined`         | 自定义 return 中的 `container`
   *  | `pointerEvents`       | *`'none'\|'auto'`*         | `'none'`            | container 的 css属性：`pointer-events` 的值 |
   *  | `autoRender`          | *`boolean`*                | `true`              | 是否自动渲染，通常为true |
   *  | `mode`                | *`'front'\|'behind'`*      | `front`             | 两种模式:|
   *  |                                                                          | | | `front`  模式：DOM 处于 five Canvas 上方，所以无法模拟遮挡效果，需要手动检测是否可见去设置显隐 |
   *  |                                                                          | | | `behind` 模式：DOM 处于 five Canvas 下方，可以模拟真实的遮挡效果，但是 DOM 必须是非透明的 |
   *  | `behindFiveContainer` | *`HTMLElement`*            | `undefined`         | 如果 mode 为 `behind`，需要传入容器，并确保此容器位five下方，且中间无其他不透明的dom元素遮挡 |
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
   *      setEnabled: (enabled: boolean) => void  // 添加/移除 container, 同 setEnabledById(id, enabled)
   *      enable: () => void                      // 同 setEnabled(true)
   *      disable: () => void                     // 同 setEnabled(false)
   *    } | void
   * ```
   */
  public create3DDomContainer = (points: Create3DDomContainerParamsType['points'], config?: Create3DDomContainerParamsType['config']) => {
    if (this.state.disposed) return undefined
    // ==== init ====
    const mergeConfig = (() => {
      if (config?.dpr !== undefined) console.warn(`${PLUGIN_NAME}: please use "config.devicePixelRatio" replace "config.dpr"`)
      const defaultconfig = {
        ratio: 0.00216,
        devicePixelRatio: config?.dpr ?? 1,
        mode: 'front',
        autoRender: true,
      }
      return Object.assign(defaultconfig, config, config?.mode === 'behind' ? { scene: this.five.scene } : undefined) as {
        ratio: number
        devicePixelRatio: number
        autoRender: boolean
        container: HTMLElement
        pointerEvents: 'none' | 'auto'
      } & ({ mode: 'front' } | { mode: 'behind'; behindFiveContainer: HTMLElement; scene: THREE.Scene })
    })()

    const fiveElement = this.five.getElement()
    if (!fiveElement) {
      console.error(`${PLUGIN_NAME}: five.getElement() is ${fiveElement}`)
      return undefined
    }

    const { autoRender, mode } = mergeConfig

    // 自动添加dom
    const wrapper = mode === 'front' ? fiveElement.parentElement : mergeConfig.behindFiveContainer
    this.setContainer(wrapper || document.body, 'front')
    const behindFiveElement = this.getBehindFiveElement()
    if (behindFiveElement) this.setContainer(behindFiveElement, 'behind')
    this.appendToElement(wrapper || document.body, mode)

    const create3DElementResault = this.create3DElement(this.five.camera, points, { ...mergeConfig, autoRender: false })
    if (!create3DElementResault) return undefined

    const oldRender = create3DElementResault.render!
    const newRender = () => {
      if (mode === 'front') {
        oldRender()
      }
      if (mode === 'behind') {
        if (this.five.model?.loaded) oldRender()
        else this.five.once('modelLoaded', () => oldRender())
      }
    }

    if (autoRender) newRender()

    return { ...create3DElementResault, ...{ render: autoRender ? undefined : newRender } }
  }

  private getBehindFiveElement() {
    const { behindFiveContainer } = this
    if (behindFiveContainer) return behindFiveContainer
    const behindFiveElement = document.createElement('div')
    behindFiveElement.style.position = 'absolute'
    behindFiveElement.style.pointerEvents = 'none'
    behindFiveElement.style.top = '0'
    behindFiveElement.style.left = '0'
    behindFiveElement.style.width = '100%'
    behindFiveElement.style.height = '100%'
    this.behindFiveContainer = behindFiveElement
    const fiveElement = this.five.getElement()
    if (!fiveElement) return
    const fiveElementPosition = fiveElement?.style.position ?? getComputedStyle(fiveElement)
    if (!fiveElementPosition || fiveElementPosition === 'static') {
      console.warn(
        'if you want to use css3DRenderPlugin behind mode, five element position is static, please set position to relative or absolute',
      )
    }
    const fiveParent = fiveElement?.parentElement
    if (fiveParent) {
      fiveParent.insertBefore(behindFiveElement, fiveElement)
      return behindFiveElement
    } else {
      return
    }
  }
}
