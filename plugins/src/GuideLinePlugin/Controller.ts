import * as BasePluginWithData from '../base/BasePluginWithData'
import * as THREE from 'three'
import type { Five } from '@realsee/five'
import type { EventMap, PluginData, PluginServerData, Route, PluginState } from './typing'
import type { BaseOptions } from '../base/BasePlugin'
import getLineGeometry from './utils/getLineGeometry'
import { getArrowMaterial } from './utils/getArrowMaterial'
import { notNil } from '../shared-utils/isNil'
import equal from '../shared-utils/equal'

const VERSION = 'v1.0.1'

const PLUGIN_NAME = 'GuideLinePlugin'

const PLUGIN = `${PLUGIN_NAME}@${VERSION}`

export const pluginFlag = (name: string) => `${PLUGIN}--${name}`

export default class Controller extends BasePluginWithData.Controller<PluginState, EventMap, PluginServerData, PluginData> {
  public static lasestVersion = VERSION

  public state = {
    visible: false,
    enabled: true,
    disposed: false,
  }

  protected data?: PluginData

  private linesGroup?: THREE.Group

  public constructor(five: Five) {
    super(five)
    Object.assign(window, { [`__${PLUGIN_NAME}_DEBUG__`]: this })
  }

  public async load(serverData: PluginServerData | PluginData, state?: PluginState, userAction = true): Promise<void> {
    const prevData = this.data ? JSON.parse(JSON.stringify(this.data)) : undefined

    // format server data to plugin data
    const data = await this.formatData(serverData)
    this.hooks.emit('dataChange', data, prevData)
    this.data = data

    // render line group
    if (this.linesGroup) this.five.scene.remove(this.linesGroup)
    const linesGroup = this.getLinesGroup(data.routes)
    if (!linesGroup) return
    this.linesGroup = linesGroup
    this.five.scene.add(linesGroup)
    this.handleVisible(this.state.visible)
    this.handleEnable(this.state.enabled)

    // initialize plugin state
    if (state) this.setState(state)

    // load end
    this.five.needsRender = true
    this.hooks.emit('dataLoaded', data)
    console.log(`${PLUGIN} loaded`, data)
  }

  public async formatData(serverData: any) {
    if (typeof serverData === 'object' && serverData !== null && serverData.version && serverData.data) {
      return serverData.data as PluginData
    }
    return serverData as PluginData
  }

  public async show(options?: { userAction?: boolean }) {
    this.setState({ visible: true }, options)
  }

  public async hide(options?: { userAction?: boolean }) {
    this.setState({ visible: false }, options)
  }

  public enable(options?: { userAction?: boolean }) {
    this.setState({ enabled: true }, options)
  }

  public disable(options?: { userAction?: boolean }) {
    this.setState({ enabled: false }, options)
  }

  public dispose() {
    this.setState({ disposed: true })
  }

  public setState(state: Partial<PluginState>, options?: { userAction?: boolean }) {
    if (this.state.disposed) return this.disposedErrorLog()
    const prevState = { ...this.state }
    this.state = { ...this.state, ...state }
    if (state.disposed !== undefined && state.disposed !== prevState.disposed) {
      if (state.disposed) this.handleDispose()
    }
    if (state.visible !== undefined && state.visible !== prevState.visible) {
      this.handleVisible(state.visible, options?.userAction)
    }
    if (state.enabled !== undefined && state.enabled !== prevState.enabled) {
      this.handleEnable(state.enabled, options?.userAction)
    }

    if (!equal(prevState, this.state, { deep: true })) {
      this.hooks.emit('stateChange', { state: this.state, prevState, userAction: options?.userAction ?? true })
      this.five.needsRender = true
    }
  }

  private handleEnable(enabled: boolean, userAction = true): void {
    if (this.linesGroup) {
      if (enabled) {
        this.five.scene.add(this.linesGroup)
        this.actionWhenEnabled(() => this.hooks.emit('enable', { userAction }))
      } else {
        this.five.scene.remove(this.linesGroup)
        this.hooks.emit('disable', { userAction })
      }
    }
  }

  private handleVisible(visible: boolean, userAction = true): void {
    if (this.linesGroup) {
      if (visible) {
        this.linesGroup.visible = true
        this.actionWhenEnabled(() => this.hooks.emit('show', { userAction }))
      } else {
        this.linesGroup.visible = false
        this.actionWhenEnabled(() => this.hooks.emit('hide', { userAction }))
      }
    }
  }

  private handleDispose() {
    if (this.linesGroup) this.five.scene.add(this.linesGroup)
  }

  /**
   * 获取多条路线的 Mesh Group
   */
  private getLinesGroup(routes: Route[]) {
    /** 'as THREE.Mesh[]' for build check */
    const meshes = routes.map(this.getLineMesh.bind(this)).filter(notNil) as THREE.Mesh[]
    const group = new THREE.Group()
    group.name = pluginFlag('route-group')
    if (meshes.length === 0) return
    group.add(...meshes)
    return group
  }

  /**
   * 获取单条路线的 Mesh
   */
  private getLineMesh(data: Route) {
    const positions = data.panoIndexList.map((panoIndex) => this.five.work.observers[panoIndex]?.standingPosition).filter(notNil)
    const geometry = getLineGeometry(positions)
    if (!geometry) return
    const material = getArrowMaterial({ textureUrl: data.arrowTextureUrl })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = pluginFlag('route-line-mesh')
    // mesh.renderOrder = 3
    return mesh
  }

  private disposedErrorLog = () => {
    console.error(`${PLUGIN} is disposed`)
  }

  private actionWhenEnabled = <T = any>(func: () => T) => {
    if (this.state.enabled) return func()
  }
}
