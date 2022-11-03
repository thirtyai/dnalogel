import { Five, Mode, Subscribe } from '@realsee/five'
import { Quaternion } from 'three'
import objectAssignDeep from 'object-assign-deep'
import { writable } from 'svelte/store'

import type { Tag, ContentType, PartialDeep, TagId, Tags, TagElement, EventMap, MediaStore, State, AddTagConfig } from '../typings'
import TagContainerSvelte from '../Components/TagContainer.svelte'
import TagContentSvelte from '../Components/Tag/index.svelte'
import {
  addDebugPoints,
  arrayPositionToVector3,
  actionAfterFiveModelLoad,
  debounce,
  normalPositionToPositions,
  planeNormal,
  random,
  resizeObserver,
  throttle,
} from '../utils'
import { TagComputer } from './TagComputer'
import { CSS3DRenderPluginExportType, CSS3DRenderPlugin } from '../../CSS3DRenderPlugin'
import type { PanoTagPluginParamsInterface } from '..'
import { ArrayPosition, DimensionType, PointType, TemporaryState } from '../typings'

// declare const __APP_VERSION__: string
const VERSION = '1.2.6'

const PLUGIN_NAME = `DnalogelPlugin-PanoTagPlugin@${VERSION}`

// 初始是否展开
const TAG_INITIAL_UNFOLDED = false

export const pluginFlag = (name: string) => `${PLUGIN_NAME}--${name}`

class PanoTagPluginController extends TagComputer {
  /** 版本号 */
  public version = VERSION

  /** state */
  public state = { enabled: true, visible: true }

  /** 插件参数 */
  private params: NonNullable<Required<PanoTagPluginParamsInterface>>

  /** debug */
  private debug: boolean

  /** css3DRenderPlugin */
  private css3DRenderPlugin?: CSS3DRenderPluginExportType

  /** 点标签 */
  private TagContainerSvelte?: TagContainerSvelte

  /** 临时状态 */
  private temporaryState: TemporaryState = { visible: true }

  private mediaStore: MediaStore = writable({
    currentMediaUrl: '',
  })

  private store: {
    /** 清理函数数组 */
    disposers: (() => any)[]
    visibleWithAnimation?: boolean
    css3DRenderDisposer: Map<TagId, () => void>
    eventListenerDisposer?: () => void
    resizeObserverDisposer?: () => void
    resizeObserverDisposerAdding: boolean
    disposed: boolean
  } = {
    disposers: [],
    disposed: false,
    resizeObserverDisposerAdding: false,
    css3DRenderDisposer: new Map<TagId, () => void>(),
  }

  private staticUrl: string

  public constructor(
    five: Five,
    params?: {
      debug?: boolean
      mergePluginDefaultConfigToLoadDataConfig?: boolean
      staticConfig?:
        | {
            host?: string
            protocol?: string
            port?: number
          }
        | string
      config?: {
        globalConfig?: Tags['globalConfig']
        contentTypeConfig?: Tags['contentTypeConfig']
      }
    },
  ) {
    super(five)
    this.params = {
      debug: false,
      mergePluginDefaultConfigToLoadDataConfig: false,
      config: this.config,
      staticConfig: {
        host: 'vrlab-static.ljcdn.com',
      },
      ...params,
    }
    this.debug = this.params.debug
    this.config = this.params.config
    this.staticUrl = (() => {
      const staticConfig = this.params.staticConfig
      if (typeof staticConfig === 'string') {
        return staticConfig
      } else {
        const protocol = staticConfig.protocol ? staticConfig.protocol + ':' : ''
        const host = staticConfig.host ?? 'vrlab-static.ljcdn.com'
        const port = staticConfig.port ? ':' + staticConfig.port : ''
        return `${protocol}//${host}${port}`
      }
    })()
    Object.assign(window, { __PANOTAGPLUGIN_DEBUG__: this })
  }

  /**
   * @description: 加载数据
   */
  public load(data: Tags, config?: AddTagConfig) {
    this.clearTags()

    console.log(PLUGIN_NAME, 'load:', { data })

    if (this.params.mergePluginDefaultConfigToLoadDataConfig) {
      this.config = objectAssignDeep({}, this.config, {
        globalConfig: data.globalConfig ?? {},
        contentTypeConfig: data.contentTypeConfig ?? {},
      })
    } else {
      if (data.globalConfig) this.config.globalConfig = data.globalConfig
      if (data.contentTypeConfig) this.config.contentTypeConfig = data.contentTypeConfig
    }

    this.addTag(data.tagList, config)
    // debug
    if (this.debug) addDebugPoints(this.five, this.tags)
  }

  /**
   * @description: 添加标签
   */
  public addTag(tag: Tag | Tag[], config?: AddTagConfig) {
    const tags = Array.isArray(tag) ? tag : [tag]
    const _tags = tags
      .map((tag) => {
        const config = this.getTagConfig(tag)
        return {
          ...tag,
          state: { visible: undefined, unfolded: TAG_INITIAL_UNFOLDED, ...config.initialState },
          hooks: new Subscribe(),
          clickable: config.clickable,
        }
      })
      .filter((tag) => tag.position)
    this.tags.push(..._tags)
    actionAfterFiveModelLoad(this.five, () => {
      // 添加事件
      if (this.store.eventListenerDisposer) {
        this.store.eventListenerDisposer?.()
      }
      if (this.state.enabled) {
        this.store.eventListenerDisposer = this.addEventListener()
      }
      this.addResizeListener()
      this.checkPanelTag()

      // v0.3.8 新增 withAnimation，默认 false
      // v1.0.0 withAnimation 默认值改为 true
      this.setVisibleAndUnfolded({ withAnimation: config?.withAnimation ?? true }).then(() => this.updateRenderAllTags())

      this.updateRenderAllTags()
    })
  }

  public clearTags() {
    this.tags = []
    this.clearCache()
    this.disposeAllCSS3DContainer()
    this.updateRenderAllTags()
  }

  public async show(params?: { userAction?: boolean; withAnimation?: boolean }) {
    const { userAction = true, withAnimation = false } = params ?? {}
    if (this.store.disposed) return this.disposedErrorLog()
    this.setState({ visible: true }, { userAction, visibleWithAnimation: withAnimation })
    this.hooks.emit('show', { userAction, withAnimation })
  }

  public async hide(params?: { userAction?: boolean; withAnimation?: boolean }) {
    const { userAction = true, withAnimation = false } = params ?? {}
    if (this.store.disposed) return this.disposedErrorLog()
    this.setState({ visible: false }, { userAction, visibleWithAnimation: withAnimation })
    this.hooks.emit('hide', { userAction, withAnimation })
  }

  public enable(params?: { userAction?: boolean }) {
    const { userAction = true } = params ?? {}
    if (this.store.disposed) return this.disposedErrorLog()
    this.setState({ enabled: true }, { userAction })
    this.hooks.emit('enable', { userAction })
  }

  public disable(params?: { userAction?: boolean }) {
    const { userAction = true } = params ?? {}
    if (this.store.disposed) return this.disposedErrorLog()
    this.setState({ enabled: false }, { userAction })
    this.hooks.emit('disable', { userAction })
  }

  /**
   * @description: 销毁
   */
  public dispose(): void {
    this.disposeAllCSS3DContainer()
    this.TagContainerSvelte?.$destroy()
    this.filter3DTag().forEach((tag) => tag.tag3DContentSvelte?.svelteApp.$destroy())
    this.tags = []
    this.store.disposers?.forEach((d) => d?.())
    this.store.disposers = []
    this.store.disposed = true
    this.store.eventListenerDisposer?.()
    this.store.eventListenerDisposer = undefined
    this.store.resizeObserverDisposer?.()
    this.store.resizeObserverDisposer = undefined
    this.store.resizeObserverDisposerAdding = false
    this.clearCache()
    this.hooks.emit('dispose')
  }

  public setState(state: Partial<State>, params: { userAction?: boolean; visibleWithAnimation?: boolean }): void {
    if (this.store.disposed) return this.disposedErrorLog()
    const { userAction = true, visibleWithAnimation = false } = params
    const prevState = { ...this.state }
    this.state = Object.assign(this.state, state)
    this.store.visibleWithAnimation = visibleWithAnimation
    if (prevState.visible !== this.state.visible) {
      state.visible ? this.handleShow() : this.handleHide()
    }
    if (prevState.enabled !== this.state.enabled) {
      state.enabled ? this.handleEnable() : this.handleDisable()
    }
    this.hooks.emit('stateChange', { state: this.state, prevState, userAction })
  }

  /**
   * @description: 修改3D标签normal
   */
  public changeTagNormalById(id: TagId, normal: ArrayPosition) {
    const tag = this.getTagById(id)
    if (!tag) return
    if (!tag.tag3DContentSvelte) return
    tag.tag3DContentSvelte.currentNormal = arrayPositionToVector3(normal)
    this.updateRenderPlaneTag()
  }

  /**
   * @description: 改变data
   */
  public changeDataById<C extends ContentType = ContentType.Custom>(id: TagId, data: PartialDeep<Tag<C>['data']>, deepMerge = true) {
    const tag = this.getTagById(id)
    if (!tag) return
    if (deepMerge) {
      tag.data = objectAssignDeep({}, tag.data, data)
    } else {
      Object.assign(tag.data, data)
    }
    // 3D 转 2D 的时候要销毁 3D container
    this.checkPanelTag()
    this.updateRenderAllTags()
  }

  /**
   * @description: 改变tag任意属性
   */
  public changeTagById<C extends ContentType = ContentType.Custom>(
    id: TagId,
    tag: PartialDeep<{ [P in keyof Pick<Tag<C>, 'enabled' | 'style' | 'dimensionType' | 'contentType' | 'data' | 'normal'>]: Tag[P] }>,
    deepMerge = true,
  ) {
    const currentTag = this.getTagById(id)
    if (!tag) return
    if (deepMerge) {
      objectAssignDeep(currentTag as any, tag)
    } else {
      Object.assign(currentTag as any, tag)
    }
    if (currentTag?.tag3DContentSvelte && tag?.normal) {
      currentTag.tag3DContentSvelte.currentNormal = arrayPositionToVector3(tag.normal as ArrayPosition)
    }
    this.updateRenderAllTags()
    this.checkPanelTag()
  }

  /**
   * @description: 销毁tag
   */
  public destroyTagById(id: TagId | TagId[]) {
    const ids = Array.isArray(id) ? id : [id]
    ids.forEach((id) => {
      const index = this.tags.findIndex((tag) => tag.id === id)
      if (index === -1) return
      this.tags.splice(index, 1)
    })
    this.updateRenderAllTags()
  }

  /** 暂停当前标签内进行的所有多媒体 */
  public pauseCurrentMedia() {
    this.mediaStore.set({ currentMediaUrl: '' })
  }

  /**
   * @description: 设置 visible 和 unfolded
   */
  private async setVisibleAndUnfolded({ withAnimation }: { withAnimation?: boolean } = { withAnimation: false }) {
    this.setVisibleByPanoIndex()
    if (withAnimation) {
      return new Promise<void>((resolve, reject) => {
        // setTimeout 初始隐藏，然后展开，而不是一步到位，要不就没动画了
        setTimeout(() => {
          this.setUnfoldedByPanoIndex()
          resolve()
        }, 10) // 10ms 是等待 TextTag onMount
      })
    } else {
      this.setUnfoldedByPanoIndex()
      return Promise.resolve()
    }
  }

  private handleShow() {
    this.state.visible = true
    this.updateTagContainerVisible()
  }

  private handleHide() {
    this.state.visible = false
    this.updateTagContainerVisible()
  }

  private handleEnable() {
    this.state.enabled = true
    this.store.eventListenerDisposer = this.addEventListener()
    this.updateRenderAllTags()
  }

  private handleDisable() {
    this.state.enabled = false
    this.store.eventListenerDisposer?.()
    this.TagContainerSvelte?.$set({ tags: [] })
    this.filter3DTag().forEach((tag) => {
      tag.tag3DContentSvelte?.svelteApp.$destroy()
      tag.tag3DContentSvelte = undefined
    })
  }

  private disposedErrorLog = () => {
    console.error(`${PLUGIN_NAME} is disposed`)
  }

  /**
   * @description: 添加 cameraUpdate, panoArrived 等事件监听
   */
  private addEventListener() {
    const { five, hooks } = this

    const handleFiveWantsMoveToPano = this.handleFiveWantsMoveToPano.bind(this)
    const handleFiveModeChange = this.handleFiveModeChange.bind(this)
    const handleFiveCameraUpdate = this.handleFiveCameraUpdate.bind(this)
    const handleFiveCameraUpdateDebounce = this.handleFiveCameraUpdateDebounce()
    const handleFivePanoArrived = this.handleFivePanoArrived.bind(this)
    const clickhandler = this.clickhandler.bind(this)

    // 走点/切换模型时临时隐藏
    five.on('wantsMoveToPano', handleFiveWantsMoveToPano)
    five.on('modeChange', handleFiveModeChange)
    // Five旋转时更新位置
    five.on('cameraUpdate', handleFiveCameraUpdate)
    five.on('cameraUpdate', handleFiveCameraUpdateDebounce)
    five.on('panoArrived', handleFivePanoArrived)

    hooks.on('click', clickhandler)

    return () => {
      five.off('wantsMoveToPano', handleFiveWantsMoveToPano)
      five.off('modeChange', handleFiveModeChange)
      five.off('cameraUpdate', handleFiveCameraUpdate)
      five.off('cameraUpdate', handleFiveCameraUpdateDebounce)
      five.off('panoArrived', handleFivePanoArrived)
      hooks.off('click', clickhandler)
      this.store.eventListenerDisposer = undefined
    }
  }

  private addResizeListener() {
    // resizeObserverDisposerAdding 避免200ms内重复执行 addResizeObserver
    if (!this.store.resizeObserverDisposer && !this.store.resizeObserverDisposerAdding) {
      const resizeObserverDisposer = this.addResizeObserver()
      this.store.resizeObserverDisposerAdding = true
      setTimeout(() => {
        this.store.resizeObserverDisposer = resizeObserverDisposer
        this.store.resizeObserverDisposerAdding = false
      }, 200)
    }
  }

  private addResizeObserver() {
    if (!this.store.disposed) return
    const observerELement = this.five.getElement()
    // resize
    const show = () => {
      if (!this.state.enabled) return
      this.show()
      this.updateRenderAllTags()
    }
    const hide = () => {
      if (!this.state.enabled) return
      this.hide()
    }
    const { observe: hideObserve, unobserve: hideUnobserve } = resizeObserver(
      throttle(() => {
        /**
         * 加这个判断是因为，第一次添加监听的时候会触发此函数，本来是没问题的，hide()后立马show()，但是show()加了debounce，所以resize触发后先hide，再过500ms才show，就有问题，所以加了这么一个限制
         * 在addTag函数中，先addResizeObserver()，过150ms再设置this.store.resizeObserverDisposer，200ms是resizeObserver添加时间到检测到resize触发resizeObserver的时间，大约100ms，这里加一点
         */
        if (!this.store.resizeObserverDisposer) return
        hide()
      }, 500),
      observerELement,
    )
    const { observe: showObserve, unobserve: showUnobserve } = resizeObserver(
      debounce(() => show(), 400),
      observerELement,
    )
    hideObserve()
    showObserve()

    return () => {
      hideUnobserve()
      showUnobserve()
    }
  }

  /**
   * @description: 切换模式处理函数
   */
  private handleFiveModeChange(mode: Mode) {
    if (mode === 'Panorama') this.five.once('panoArrived', () => this.temporaryShow())
    else this.temporaryHide()
  }

  private handleFiveWantsMoveToPano() {
    this.tags.forEach((tag) => {
      const config = this.getTagConfig(tag)
      if (typeof config.visibleConfig === 'object' && config.visibleConfig.keep) {
        tag.temporaryState = { ...tag.temporaryState, visible: config.visibleConfig.keep === 'visible' }
      } else if (typeof config.visibleConfig === 'object' && config.visibleConfig.alwaysShowWhenMovePano) {
        tag.temporaryState = { ...tag.temporaryState, visible: true }
      } else {
        tag.temporaryState = { ...tag.temporaryState, visible: false }
      }
    })
    this.updateRenderAllTags()
  }

  /**
   * @description: 走点/切换模型后显示
   */
  private temporaryShow() {
    this.temporaryState.visible = true
  }

  /**
   * @description: 走点/切换模型时临时隐藏
   */
  private temporaryHide() {
    this.temporaryState.visible = false
  }

  private clickhandler(params: Parameters<EventMap['click']>[0]) {
    if (params.target !== 'TagPoint') return
    if (!params.tag.state) return console.warn('Clickhandler: params.tag.state is undefined')
    // 先检查一下能不能打开/关闭
    const canBeFold = this.canBe('fold', params.tag)
    const canBeUnfold = this.canBe('unfold', params.tag)
    if (canBeFold && canBeUnfold) {
      // 展开/收起 点击的标签
      params.tag.state.unfolded = !params.tag.state.unfolded
      // 点开的话，收起其他标签
      if (params.tag.state.unfolded) {
        this.tags.forEach((tag) => {
          if (tag.id === params.tag.id) return
          if (tag.state) {
            const canBeFold = this.canBe('fold', tag)
            if (canBeFold) tag.state.unfolded = false
          }
        })
      }
      this.updateRenderAllTags()
    }
  }

  /**
   * @description: 更新所有标签
   */
  private updateRenderAllTags() {
    this.updateRenderPointTag()
    this.updateRenderPlaneTag()
  }

  private updateTagContainerVisible() {
    this.TagContainerSvelte?.$set({
      state: this.state,
      temporaryState: this.temporaryState,
      withAnimation: this.store.visibleWithAnimation,
    })
    this.filter3DTag().forEach((tag) => {
      tag.tag3DContentSvelte?.svelteApp.$set({
        state: this.state,
        temporaryState: this.temporaryState,
        withAnimation: this.store.visibleWithAnimation,
      })
    })
  }

  private handleFiveCameraUpdateDebounce() {
    return debounce(() => {
      // 设置展开/收起
      this.setUnfoldedByCamera()
      // 渲染
      this.updateRenderAllTags()
    }, 100)
  }

  private handleFiveCameraUpdate() {
    // 渲染
    this.updateRenderPointTag()
  }

  private async handleFivePanoArrived() {
    await this.setVisibleAndUnfolded()
    this.tags.forEach((tag) => {
      tag.temporaryState = { ...tag.temporaryState, visible: true }
    })
    // 渲染
    this.updateRenderAllTags()
  }

  private setUnfoldedByCamera() {
    let hasTagUnfolded = false // 是否有标签由于camera的转动而展开
    this.tags.forEach((tag) => {
      const unfolded = this.getUnfoldedByCamera(tag)
      if (!tag.state) return
      if (unfolded === undefined) return
      if (unfolded === true) hasTagUnfolded = true
      tag.state.unfolded = unfolded
    })

    if (hasTagUnfolded) {
      this.tags.forEach((tag) => {
        const unfoldedConfig = this.getTagConfig(tag).unfoldedConfig
        if (typeof unfoldedConfig === 'object') {
          if (unfoldedConfig.autoUnfold) return // 如果有标签由于camera的转动而展开，则将所有没有配置autoUnfold的标签收起
          if (unfoldedConfig.disableFold) return // 不收起disableFold标签
          if (unfoldedConfig.keep) return // 不动keep标签
        }
        if (tag.state) tag.state.unfolded = false
      })
    }
  }

  /**
   * @description: 渲染单个点的标签
   */
  private updateRenderPointTag() {
    const tags = this.filterPointTag()
    this.setPointTagPosition()
    if (!this.TagContainerSvelte) {
      const tag2DContainer = this.five.getElement()?.parentElement
      if (!tag2DContainer) return console.error('updateRenderPlaneTag: tag2DContainer not found')
      this.TagContainerSvelte = new TagContainerSvelte({
        target: tag2DContainer,
        props: { hooks: this.hooks, tags, state: this.state, temporaryState: this.temporaryState, mediaStore: this.mediaStore },
      })
    } else {
      this.TagContainerSvelte.$set({ tags, state: this.state, temporaryState: this.temporaryState })
    }
  }

  /**
   * @description: 渲染3D贴片
   */
  private updateRenderPlaneTag() {
    const planeTags = [...this.filterPlaneTag(), ...this.filter3DPointTag()]

    planeTags.forEach((tag) => {
      // 初始化 TagContentSvelte
      if (!tag.tag3DContentSvelte) {
        if (tag.state?.visible === false) return
        if (!this.css3DRenderPlugin) this.css3DRenderPlugin = CSS3DRenderPlugin(this.five)
        if (tag.pointType === PointType.PointTag && !tag.normal) return console.error('updateRenderPlaneTag: 三维点标签缺少法向量！')
        // 四个点
        const positions =
          tag.pointType === PointType.PlaneTag
            ? tag.position
            : normalPositionToPositions(this.five.camera.position, arrayPositionToVector3(tag.position), arrayPositionToVector3(tag.normal))
        const normal = tag.pointType === PointType.PlaneTag ? planeNormal(tag.position) : arrayPositionToVector3(tag.normal)
        const create3DDomContainerConfig = this.getTagConfig(tag as Tag).tag3DConfig
        const domContainer = this.css3DRenderPlugin.create3DDomContainer(positions, create3DDomContainerConfig)
        if (!domContainer) return
        this.store.css3DRenderDisposer.set(tag.id, domContainer.dispose)
        tag.tag3DContentSvelte = {
          svelteApp: new TagContentSvelte({
            target: domContainer.container,
            props: {
              tag: tag as TagElement,
              hooks: this.hooks,
              state: this.state,
              mediaStore: this.mediaStore,
              temporaryState: this.temporaryState,
            },
          }),
          domContainer,
          initialNormal: normal,
          currentNormal: normal,
        }
      } else {
        const { svelteApp, domContainer, initialNormal, currentNormal } = tag.tag3DContentSvelte
        svelteApp.$set({
          tag: tag as TagElement,
          hooks: this.hooks,
          state: this.state,
          temporaryState: this.temporaryState,
        })
        if (!initialNormal.equals(currentNormal)) {
          const quaternion = new Quaternion().setFromUnitVectors(initialNormal, currentNormal)
          domContainer.css3DObject.setRotationFromQuaternion(quaternion)
        }
      }
    })
    this.checkPanelTag()
  }

  private disposeAllCSS3DContainer() {
    for (const [id, disposer] of this.store.css3DRenderDisposer) disposer?.()
    this.store.css3DRenderDisposer = new Map()
  }

  /**
   * @description: 检查并销毁不用的3D贴片
   */
  private checkPanelTag() {
    // 3D 转 2D 的时候要销毁 3D container
    this.tags.forEach((tag) => {
      if (tag.dimensionType === DimensionType.Two && tag.pointType === PointType.PointTag) {
        tag.tag3DContentSvelte?.domContainer.dispose()
        tag.tag3DContentSvelte = undefined
      }
    })
    for (const [id, disposer] of this.store.css3DRenderDisposer) {
      const tag = this.getTagById(id)
      if (!tag || tag.dimensionType !== DimensionType.Three) {
        disposer?.()
        this.store.css3DRenderDisposer.delete(id)
      }
    }
  }
}

export default PanoTagPluginController
export { PanoTagPluginController }
