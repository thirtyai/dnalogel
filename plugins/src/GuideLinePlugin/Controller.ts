import * as BasePluginWithData from '../base/BasePluginWithData'
import * as THREE from 'three'
import type { Five } from '@realsee/five'
import type { EventMap, PluginData, PluginServerData, Route, PluginState } from './typing'
import getLineGeometries from './utils/getLineGeometries'
import { getArrowMaterial } from './utils/getArrowMaterial'
import { notNil } from '../shared-utils/isNil'
import equal from '../shared-utils/equal'
import type { Config } from '../base/BasePlugin'

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

  public constructor(five: Five, config?: Config) {
    super(five, config)
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

    // wait for five model loaded
    await this.waitFiveModelLoaded()

    // add line group to scene
    this.five.scene.add(linesGroup)

    // set state
    this.handleVisible(this.state.visible)
    this.handleEnable(this.state.enabled)

    // initialize plugin state
    if (state) this.setState(state)

    // loaded
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
    /** 'as THREE.Object3D[]' for build check */
    const meshes = routes.map(this.getLine.bind(this)).filter(notNil) as THREE.Object3D[]
    const group = new THREE.Group()
    group.name = pluginFlag('route-group')
    if (meshes.length === 0) return
    group.add(...meshes)
    return group
  }

  /**
   * 获取单条路线
   */
  private getLine(data: Route) {
    const group = new THREE.Group()
    const positions = data.panoIndexList.map((panoIndex) => this.five.work.observers[panoIndex]?.standingPosition).filter(notNil)
    const geometries = getLineGeometries(positions, {
      skipPanoIndexMesh: data.skipPanoIndexMesh ?? true,
      unitWidth: data.unitWidth ?? 0.6,
      unitHeight: data.unitHeight ?? 0.4,
    })
    if (!geometries) return
    const material = getArrowMaterial({ textureUrl: data.arrowTextureUrl ?? this.staticPrefix + '/release/web/arrow6.b6ce0c62.png' })
    geometries.forEach((geometry) => {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = pluginFlag('route-line-mesh')
      group.add(mesh)
    })
    // mesh.renderOrder = 3
    return group
  }

  private disposedErrorLog = () => {
    console.error(`${PLUGIN} is disposed`)
  }

  private actionWhenEnabled = <T = any>(func: () => T) => {
    if (this.state.enabled) return func()
  }

  /**
   * @description: Wait for five model ready
   */
  private async waitFiveModelLoaded() {
    return new Promise<void>((resolve) => {
      if (this.five.model.loaded) {
        resolve()
        return
      }
      this.five.once('modelLoaded', () => {
        resolve()
      })
    })
  }
}
