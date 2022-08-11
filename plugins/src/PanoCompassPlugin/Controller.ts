import * as THREE from 'three'
import { Five, Mode, Pose } from '@realsee/five'
import type { BaseOptions } from '../base/BasePlugin'
import * as BasePlugin from '../base/BasePluginWithData'
import { getRoomInfoInstance } from './getRoomInfoInstance'
import { loadTexture } from '../shared-utils/three/loadTexture'
import CSS3DRenderPlugin, { CSS3DRenderPluginExportType } from '../CSS3DRenderPlugin'
import { BetterTween, tweenProgress } from '../shared-utils/animationFrame/BetterTween'

import type {
  EventMap,
  PanoCompassPluginData,
  PanoCompassPluginParameterType,
  PluginData,
  PluginServerData,
  State,
} from './typings'

const defaultBaseOptions: Required<BaseOptions> = { userAction: true }

export class PanoCompassController extends BasePlugin.Controller<
  State,
  EventMap,
  PluginServerData,
  PluginData
> {
  /**
   * 默认状态
   */
  public state: State = {
    visible: true,
    enabled: true,
    config: {
      /**
       * @todo 图片转base64
       */
      compassImageUrl: '//vrlab-image4.ljcdn.com/release/web/v3/north-point-circle.96498e69.png',
      entryDoorImageUrl: '//vrlab-image4.ljcdn.com/release/web/enterDoor.831b8208.png',
    },
  }
  public data?: PanoCompassPluginData
  private group = new THREE.Group()
  private roomInfoInstance?: ReturnType<typeof getRoomInfoInstance>
  private roomInfoWrapperInstance?: ReturnType<CSS3DRenderPluginExportType['create3DDomContainer']>
  private compassMeshTween?: BetterTween<{ progress: number }>
  private compassMesh?: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
  private entryDoorMesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>

  public constructor(five: Five, config?: PanoCompassPluginParameterType) {
    super(five)
    this.five.scene.add(this.group)
    this.five.once('dispose', this.dispose)
    this.setState({
      visible: true,
      enabled: true,
      config: {
        ...this.state.config,
        ...(config || {}),
      },
    })
  }

  /**
   * 启用插件，响应用户操作并展示UI
   * @param options
   */
  public enable(options: Required<BaseOptions> = defaultBaseOptions): void {
    this.setState(
      {
        enabled: true,
      },
      options,
    )
  }

  /**
   * 禁用插件，禁止响应用户操作并隐藏UI
   * @param options
   */
  public disable(options: Required<BaseOptions> = defaultBaseOptions): void {
    this.setState(
      {
        enabled: false,
      },
      options,
    )
  }

  /**
   * 展示UI
   * @param options
   * @returns
   * @todo 需要考虑动画
   */
  public show(options: Required<BaseOptions> = defaultBaseOptions): Promise<void> {
    if (!this.state.enabled) return
    this.setState(
      {
        visible: true,
      },
      options,
    )
    return Promise.resolve()
  }

  /**
   * 隐藏UI
   * @param options
   * @returns
   * @todo 需要考虑动画
   */
  public hide(options: Required<BaseOptions> = defaultBaseOptions): Promise<void> {
    if (!this.state.enabled) return
    this.setState(
      {
        visible: false,
      },
      options,
    )
    return Promise.resolve()
  }

  public setState(
    state: Partial<State>,
    options: Required<BaseOptions> = { userAction: true },
  ): void {
    const prevState = JSON.parse(JSON.stringify(this.state))
    this.state = {
      visible: state.visible ?? prevState.visible,
      enabled: state.enabled ?? prevState.enabled,
      config: { ...prevState.config, ...(state.config || {}) },
    }
    this.hooks.emit('stateChange', {
      state: this.state,
      prevState,
      userAction: options.userAction,
    })

    if (state.enabled === true) {
      this._enable()
      this.hooks.emit('enable', options)
    }
    if (state.enabled === false) {
      this._disable()
      this.hooks.emit('disable', options)
    }

    if (state.visible === false) {
      this._toggleVisible()
      this.hooks.emit('hide', options)
    }

    if (state.visible === true) {
      this._toggleVisible()
      this.hooks.emit('show', options)
    }

    /**
     * @todo config变化不应该重新初始化，需要做精准的替换
     */
    if (state.config) {
      this.init()
    }
  }

  public async load(data: PluginServerData | PluginData, state?: State, userAction = true) {
    const nextData = await this.formatData(data)
    if (JSON.stringify(this.data) !== JSON.stringify(nextData)) {
      this.hooks.emit('dataChange', nextData, this.data)
      this.data = { ...nextData }
      this.init()
      if (state) {
        this.setState(state, { userAction })
      }
      this.hooks.emit('dataLoaded', this.data)
    }
  }

  /**
   * 销毁插件
   * @todo 销毁贴图时，最好还是直接销毁贴图吧，this.compassMesh?.material.map 这种都是很深层的引用了。THREE 的建议我看也是自己去管理和销毁公共贴图。
   */
  public dispose = () => {
    this.five.scene.remove(this.group)
    this.group.remove(...this.group.children)
    this.compassMesh?.material.map?.dispose()
    this.entryDoorMesh?.material.map?.dispose()
    this.five.off('dispose', this.dispose)
    this.five.off('panoArrived', this.onFivePanoArrived)
    this.five.off('panoWillArrive', this.onFivePanoWillArrive)
    this.five.off('cameraDirectionUpdate', this.onFiveCameraDirectionUpdate)
  }

  protected formatData(serverData: PluginServerData | PluginData): Promise<PluginData> {
    if ((serverData as PluginServerData).version && (serverData as PluginServerData).data) {
      return Promise.resolve((serverData as PluginServerData).data)
    } else {
      return Promise.resolve(serverData as unknown as PluginData)
    }
  }

  /**
   * 添加事件监听
   */
  private _addEventListener = () => {
    this.five.on('panoArrived', this.onFivePanoArrived)
    this.five.on('panoWillArrive', this.onFivePanoWillArrive)
    this.five.on('modeChange', this.onFiveModeChange)
    this.five.on('cameraDirectionUpdate', this.onFiveCameraDirectionUpdate)
  }

  /**
   * 移除事件监听
   */
  private _removeEventListener = () => {
    this.five.off('panoArrived', this.onFivePanoArrived)
    this.five.off('panoWillArrive', this.onFivePanoWillArrive)
    this.five.off('modeChange', this.onFiveModeChange)
    this.five.off('cameraDirectionUpdate', this.onFiveCameraDirectionUpdate)
  }

  /**
   * 启用，响应事件，展示UI
   */
  private _enable = () => {
    this.five.scene.add(this.group)
    this.init()
    this.onFivePanoArrived(this.five.panoIndex || 0)
    this._addEventListener()
  }

  /**
   * 禁用，不响应事件，不展示UI
   */
  private _disable = () => {
    this._clearCompassIfNeed()
    this._clearEntryDoorIfNeed()
    this.five.scene.remove(this.group)
    this._removeEventListener()
  }

  /**
   * 展示UI
   */
  private _toggleVisible = () => {
    this.group.visible = this.state.visible
    this.five.needsRender = true
  }

  private _clearCompassIfNeed = () => {
    if (this.compassMesh) {
      this.group.remove(this.compassMesh)
      this.compassMesh.material.map?.dispose()
      this.compassMesh = null
    }
  }

  private _clearEntryDoorIfNeed = () => {
    if (this.entryDoorMesh) {
      this.group.remove(this.entryDoorMesh)
      this.entryDoorMesh.material.map?.dispose()
      this.entryDoorMesh = null
    }

    if (this.roomInfoInstance) {
      this.roomInfoInstance.dispose()
      this.roomInfoInstance = null
    }

    if (this.roomInfoWrapperInstance) {
      this.roomInfoWrapperInstance.dispose()
      this.roomInfoWrapperInstance = null
    }
  }

  /**
   * 初始化
   * @todo 逻辑需要细分
   */
  private async init() {
    const northRad = this.data?.north_rad ?? null
    this._clearCompassIfNeed()
    if (northRad !== null) {
      this.compassMesh = await this.loadCompassMesh()
      this.compassMesh.rotateX(-Math.PI / 2)
      this.compassMesh.rotateZ(northRad - Math.PI / 2)
      this.group.add(this.compassMesh)
    }
    const entrance = this.data?.entrance ?? null
    this._clearEntryDoorIfNeed()
    if (entrance !== null) {
      this.entryDoorMesh = await this.loadEntryDoorMesh()
      this.roomInfoWrapperInstance = this.loadRoomInfo()
      this.roomInfoInstance = getRoomInfoInstance()
      this.entryDoorMesh.rotateX(-Math.PI / 2)
      if (this.roomInfoWrapperInstance) {
        this.roomInfoInstance.appendTo(this.roomInfoWrapperInstance.container)
      }
      this.group.add(this.entryDoorMesh)
    }
    this.onFivePanoArrived(this.five.panoIndex || 0)
    this.five.needsRender = true
  }

  private async loadCompassMesh() {
    const compassImageUrl = this.state.config.compassImageUrl
    const compassTexture = await loadTexture(compassImageUrl)
    const compassGeometry = new THREE.CircleGeometry(0.7, 32)
    const compassMaterial = new THREE.MeshBasicMaterial({
      map: compassTexture,
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
    const compassMesh = new THREE.Mesh(compassGeometry, compassMaterial)
    compassMesh.name = 'pano-compass-mesh'
    return compassMesh
  }

  private async loadEntryDoorMesh() {
    const entryDoorImageUrl = this.state.config.entryDoorImageUrl
    const entryDoorTexture = await loadTexture(entryDoorImageUrl)
    const entryDoorGeometry = new THREE.PlaneGeometry(0.2, 0.16)
    const entryDoorMaterial = new THREE.MeshBasicMaterial({
      map: entryDoorTexture,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
    })
    const entryDoorMesh = new THREE.Mesh(entryDoorGeometry, entryDoorMaterial)
    entryDoorMesh.name = 'pano-compass-entry-door'
    return entryDoorMesh
  }

  private loadRoomInfo() {
    const points = [
      new THREE.Vector3(-0.7, 0, -0.7),
      new THREE.Vector3(0.7, 0, -0.7),
      new THREE.Vector3(0.7, 0, 0.7),
      new THREE.Vector3(-0.7, 0, 0.7),
    ]
    const roomInfo = CSS3DRenderPlugin(this.five).create3DDomContainer(points)

    return roomInfo
  }

  private onFivePanoWillArrive = (panoIndex: number) => {
    if (panoIndex === this.five.panoIndex) return
    this.compassMeshTween?.dispose()
    this.compassMesh?.material.setValues({ opacity: 0 })
  }

  private onFivePanoArrived = (panoIndex: number) => {
    // ======== fix compass position ========
    const standingPosition = this.five.work?.observers?.[panoIndex]?.standingPosition
    if (this.compassMesh) {
      // 指南针上移 0.01m，防止与地板重合
      this.compassMesh.position.copy(standingPosition.clone().setY(standingPosition.y + 0.01))
      if (this.compassMesh.material.opacity === 0) {
        this.compassMeshTween?.dispose()
        this.compassMeshTween = tweenProgress(1000)
          .onUpdate(({ progress }) => {
            this.compassMesh?.material.setValues({ opacity: progress })
            this.five.needsRender = true
          })
          .play()
      }
    }
    // ======== fix entry door label position and rotation ========
    if (this.entryDoorMesh) {
      const entryDoorPosition = new THREE.Vector3(
        this.data.entrance.position.x,
        this.data.entrance.position.y,
        this.data.entrance.position.z,
      )
      const panoToEntryDoorVector = entryDoorPosition
        .clone()
        .setY(standingPosition.y)
        .sub(standingPosition)
        .normalize()
      const compassEntryDoorPosition = standingPosition
        .clone()
        .add(panoToEntryDoorVector.clone().multiplyScalar(0.7))
        .setY(standingPosition.y + 0.01)
      this.entryDoorMesh.rotation.z = new THREE.Vector3(0, 0, -1).angleTo(panoToEntryDoorVector)
      this.entryDoorMesh.position.copy(compassEntryDoorPosition)
      // 不是客厅时，隐藏入户门指引
      this.data?.room_observers[panoIndex].room.type === 1
        ? this.entryDoorMesh?.material.setValues({ opacity: 1 })
        : this.entryDoorMesh?.material.setValues({ opacity: 0 })
    }
    // ======== fix room info ========
    if (this.roomInfoInstance && this.roomInfoWrapperInstance) {
      this.roomInfoWrapperInstance.css3DObject.position.copy(
        standingPosition.clone().setY(standingPosition.y + 0.01),
      )
      this.roomInfoInstance.setRoom(this.data.room_observers[panoIndex].room)
    }
    this.five.needsRender = true
  }

  private onFiveCameraDirectionUpdate = ({
    longitude,
    latitude,
  }: {
    longitude: number
    latitude: number
  }) => {
    if (!this.roomInfoWrapperInstance) return
    this.roomInfoWrapperInstance.css3DObject.rotation.z = longitude
    latitude > 0.66 && this.five.getCurrentState().mode === 'Panorama'
      ? this.roomInfoInstance?.show()
      : this.roomInfoInstance?.hide()
  }

  // eslint-disable-next-line max-params
  private onFiveModeChange = (
    mode: Mode,
    prevMode: Mode,
    panoIndex: number,
    toPose: Pose,
    userAction: boolean,
  ) => {
    if (mode === prevMode) return
    this.setState(
      {
        visible: mode === Five.Mode.Panorama,
      },
      { userAction },
    )
  }
}
