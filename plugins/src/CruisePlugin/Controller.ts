import type { Five, Pose, State, Mode } from '@realsee/five'
import type { BaseOptions } from '../base/BasePlugin'
import * as BasePluginWithData from '../base/BasePluginWithData'
import { GuideLinePlugin, GuideLinePluginExportType } from '../GuideLinePlugin'
import uuid from '../shared-utils/uuid'
import type { PluginState, EventMap, PluginServerData, PluginData, CruiseData, CruiseKeyframe, MoveEffect } from './typing'
import { coordinatesAngle } from './utils/coordinatesAngle'
import { safeCall } from './utils/safeCall'
import equal from '../shared-utils/equal'
import { vectorToCoordinates } from './utils/vectorToCoordinates'
import * as THREE from 'three'
import linerValue from './utils/linerValue'
import { sleep } from './utils/sleep'
import type { Config } from '../base/BasePlugin'

const VERSION = 'v1.0.6'

const PLUGIN_NAME = 'CruisePlugin'

const PLUGIN = `${PLUGIN_NAME}@${VERSION}`

export const pluginFlag = (name: string) => `${PLUGIN}--${name}`

const disposedErrorLog = () => {
  console.error(`${PLUGIN} is disposed`)
}

const disableWarnLog = () => {
  console.warn(`${PLUGIN} is disabled`)
}

const disableErrorLog = () => {
  console.error(`${PLUGIN} is disabled`)
}

const pauseDataMap = new Map<string, { fiveState: Partial<State>; keyframeId?: string; playedProgress: number; duration?: number }>()

export default class CruisePluginController extends BasePluginWithData.Controller<PluginState, EventMap, PluginServerData, PluginData> {
  public static PluginVersion = VERSION

  public state: PluginState = {
    visible: true,
    enabled: true,
    disposed: false,
    playing: false,
    speed: 1,
    config: {
      speedConfig: {
        rotateSpeed: 0.001,
        rotateSpeedUnit: 'rad/ms',
        moveSpeed: 0.002,
        moveSpeedUnit: 'm/ms',
      },
    },
  }

  protected data?: PluginData

  private config?: Config

  private privateState: {
    /**
     * privateState.playing 和 state.playing 的区别：
     * state.playing 先为true，然后才 handleplay，handleplay方法内会检查privateState.playing，如果已经开始（privateState.playing === true），就不执行操作，如果为false，就执行操作
     * 其实就是加了一个不允许重复执行handleplay的逻辑
     */
    playing: boolean
    currentPlayKeyframe: {
      keyframe: CruiseKeyframe
      originDuration?: number
    } | null
    currentPlayQueue: Promise<any>[]
    fiveOriginGetProgress?: () => any
    broke: boolean
    disposers: (() => void)[]
    playId?: string
    moveToFirstPanoEffect?: MoveEffect
    modeChanging?: boolean
  } = {
    playing: false,
    currentPlayQueue: [],
    currentPlayKeyframe: null,
    broke: false,
    disposers: [],
    modeChanging: false,
  }

  private GuideLine?: GuideLinePluginExportType

  public constructor(five: Five, config?: Config) {
    super(five, config)
    this.config = config
    Object.assign(window, { [`__${PLUGIN_NAME}_DEBUG__`]: this })

    const setFiveLinearUpdateCamera = this.setFiveLinearUpdateCamera.bind(this)
    const setFiveOriginUpdateCamera = this.setFiveOriginUpdateCamera.bind(this)

    this.hooks.on('play', setFiveLinearUpdateCamera)
    this.hooks.on('broke', setFiveOriginUpdateCamera)
    this.hooks.on('end', setFiveOriginUpdateCamera)
    this.hooks.on('pause', setFiveOriginUpdateCamera)

    this.privateState.disposers.push(() => {
      this.hooks.off('play', setFiveLinearUpdateCamera)
      this.hooks.off('broke', setFiveOriginUpdateCamera)
      this.hooks.off('end', setFiveOriginUpdateCamera)
      this.hooks.off('pause', setFiveOriginUpdateCamera)
    })
  }

  /**
   * @description Load Data and State
   */
  public async load(serverData: PluginServerData | PluginServerData['data'], state?: PluginState, userAction?: boolean): Promise<void> {
    if (this.state.disposed) return disposedErrorLog()

    if (!this.privateState.fiveOriginGetProgress) {
      if (!(this.five as any).controller?.cameraMotion?.getProgress) {
        await this.waitFiveLoaded()
        this.privateState.fiveOriginGetProgress = (this.five as any).controller?.cameraMotion?.getProgress
      }
    }

    this.clear()

    // copy this.data
    const prevData = this.data ? JSON.parse(JSON.stringify(this.data)) : undefined

    // format server data to plugin data
    const data = await this.formatData(serverData)
    this.data = data
    this.hooks.emit('dataChange', data, prevData)

    let guideLinePanoIndex: number[][] = []
    let tempFloorIndex: number | undefined
    // filter panoIndex list Data
    const hasPanoIndexKeyframes = this.data.keyframes.filter((keyframe) => keyframe.data.panoIndex !== undefined)
    hasPanoIndexKeyframes
      .filter((keyframe, index) => keyframe.data.panoIndex !== hasPanoIndexKeyframes[index - 1]?.data.panoIndex) // filter repeat panoIndex
      .map((keyframe) => keyframe.data.panoIndex!)
      .forEach((panoIndex) => {
        const floorIndex = this.five.work.observers[panoIndex]?.floorIndex
        if (floorIndex === undefined) return
        if (tempFloorIndex === floorIndex) {
          const index = guideLinePanoIndex.length - 1
          guideLinePanoIndex[index] = [...(guideLinePanoIndex[index] ?? []), panoIndex]
        } else {
          tempFloorIndex = floorIndex
          const index = guideLinePanoIndex.length
          guideLinePanoIndex[index] = [panoIndex]
        }
      })

    // initialize GuideLinePlugin
    if (!this.GuideLine) this.GuideLine = GuideLinePlugin(this.five, this.config)

    // load GuideLine
    this.GuideLine?.load({ routes: guideLinePanoIndex.map((route) => ({ panoIndexList: route })) })

    // first pause
    this.setState({ playing: false })

    // set state
    this.handleVisible(this.state.visible)
    this.handleEnable(this.state.enabled)
    this.changePlayState(this.state.playing)
    this.changeSpeed(this.state.speed)

    // initialize plugin state
    if (state) this.setState(state, { userAction })

    // load end
    console.log(`${PLUGIN} loaded`, data)
    this.hooks.emit('dataLoaded', data)
  }

  /**
   * @description Play | Continue play. if have been paused, continue play from the pause position; if playing, do nothing
   */
  public play(options?: { userAction?: boolean }): void {
    this.setState({ playing: true }, options)
  }

  /**
   * @description If playing, first pause, then play from keyframes index/id
   * @param {number} options.index play from keyframes index
   * @param {string} options.id play from keyframes id
   */
  public playFrom(options: { userAction?: boolean; index?: number; id?: string }) {
    const { index, id, userAction } = options
    if (this.state.playing) this.setState({ playing: false }, { userAction })
    this.setState({ playing: true }, { userAction, playFromIndex: index, playFromId: id })
  }

  /**
   * @description Play from first keyframe
   */
  public playFromStart(options?: { userAction?: boolean }) {
    return this.playFrom({ ...options, index: 0 })
  }

  /**
   * @description Pause
   */
  public pause(options?: { userAction?: boolean }) {
    this.setState({ playing: false }, options)
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

  /**
   * @description Set state
   */
  public setState(state: Partial<PluginState>, options?: BaseOptions & Record<string, any>): void {
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
      this.handleVisible(state.visible, options?.userAction)
    }
    if (state.enabled !== undefined && state.enabled !== prevState.enabled) {
      this.handleEnable(state.enabled, options?.userAction)
    }
    if (state.playing !== undefined && state.playing !== prevState.playing) {
      this.changePlayState(state.playing, options)
    }
    if (state.speed !== undefined && state.speed !== prevState.speed) {
      this.changeSpeed(state.speed, options?.userAction)
    }

    if (!equal(prevState, this.state, { deep: true })) {
      this.hooks.emit('stateChange', { state: this.state, prevState, userAction: options?.userAction ?? true })
    }
  }

  /**
   * @description Format data
   */
  protected async formatData(serverData: PluginServerData | PluginServerData['data']): Promise<PluginData> {
    if (!this.five.work) await this.waitFiveLoaded()

    const observers = this.five.work.observers
    const data = (() => {
      const _serverData = serverData as any
      if (typeof _serverData === 'object' && _serverData !== null && _serverData.version && _serverData.data) {
        return _serverData.data as PluginServerData['data']
      }
      return _serverData as PluginServerData['data']
    })()
    if (data.keyframes) {
      return {
        keyframesId: uuid(),
        keyframes: data.keyframes.map((keyframe, index) => {
          const nextKeyframe = data.keyframes[index + 1]
          const stay = (() => {
            if (!nextKeyframe) return 0
            if (nextKeyframe.start === undefined || keyframe.end === undefined) return 0
            return nextKeyframe.start - keyframe.end
          })()
          return { id: keyframe.uuid ?? uuid(), moveIndex: index, stay, index, ...keyframe }
        }),
      }
    } else if (data.panoIndexList) {
      let keyframes: Omit<CruiseKeyframe, 'index' | 'id'>[] = []
      const { moveEffect, moveToFirstPanoEffect } = data
      this.privateState.moveToFirstPanoEffect = moveToFirstPanoEffect
      data.panoIndexList
        // .filter((panoIndex, index) => panoIndex !== data.panoIndexList[index - 1]) // remove the repeat panoIndex
        .forEach((panoIndex, index) => {
          const lookatNextPanoIndex = (() => {
            const nextPanoIndex = data.panoIndexList.slice(index).find((p) => p !== panoIndex) // find next different panoIndex
            if (nextPanoIndex === undefined) return
            const vectorFrom = observers[panoIndex]?.position
            const vectorTo = observers[nextPanoIndex]?.position
            if (!vectorTo || !vectorFrom) return
            // if panoIndex and next panoIndex isn't in same floor, return
            if (observers[panoIndex]?.floorIndex !== observers[nextPanoIndex]?.floorIndex) return
            const vector = new THREE.Vector3().subVectors(vectorTo, vectorFrom)
            return vectorToCoordinates(vector)
          })()
          if (data.moveType === undefined || data.moveType === 'justMove') {
            // move to panoIndex, latitude, longitude
            keyframes.push({
              moveIndex: index,
              stay: data.stay,
              data: { effect: 'Move', panoIndex, moveEffect, ...(lookatNextPanoIndex ?? {}) },
            })
          } else if (data.moveType === 'moveAndRotate') {
            // move to panoIndex, then rotate to latitude and longitude
            keyframes.push({ moveIndex: index, stay: data.stay, data: { effect: 'Move', panoIndex, moveEffect } })
            if (lookatNextPanoIndex)
              keyframes.push({ moveIndex: index, stay: data.stay, data: { effect: 'Rotate', panoIndex, ...lookatNextPanoIndex } })
          }
        })
      return { keyframesId: uuid(), keyframes: keyframes.map((keyframe, index) => ({ id: uuid(), index, ...keyframe })) }
    } else {
      throw new Error('format error: data no keyframes or no panoIndexList')
    }
  }

  private handleEnable(enabled: boolean, userAction = true) {
    if (enabled) {
      this.GuideLine?.enable()
      this.hooks.emit('enable', { userAction })
    } else {
      this.GuideLine?.disable()
      this.changePlayState(false, { userAction })
      this.hooks.emit('disable', { userAction })
    }
    this.state.enabled = enabled
  }

  private handleVisible(visible: boolean, userAction = true) {
    if (visible) {
      this.GuideLine?.show()
      this.actionIfStateIsEnabled(() => this.hooks.emit('show', { userAction }))
    } else {
      this.GuideLine?.hide()
      this.actionIfStateIsEnabled(() => this.hooks.emit('hide', { userAction }))
    }
    this.state.visible = visible
  }

  private changePlayState(play: boolean, options?: { userAction?: boolean; playFromIndex?: number; playFromId?: string }) {
    this.actionIfStateIsEnabled(() =>
      this.hooks.emit('playStateChange', play ? 'playing' : 'pause', { userAction: options?.userAction ?? true }),
    )
    play ? this.handlePlay(options) : this.handlePause(options)
    this.state.playing = play
  }

  /**
   * @description Play | Continue play. if have been paused, continue play from the pause position; if playing, do nothing
   * @param {number} options.playFromIndex play from keyframes index
   * @param {string} options.playFromId play from keyframes id
   */
  // eslint-disable-next-line complexity
  private async handlePlay(options?: { userAction?: boolean; playFromIndex?: number; playFromId?: string; notEmitEvent?: true }) {
    const { data, state, privateState, hooks } = this

    // check whether keyframes can be played
    if (privateState.playing) return
    if (!data?.keyframes || data?.keyframes.length === 0) return

    // set current play id
    const currentPlayId = uuid()
    // if handlePlay function is called again before play end, currentPlayId isn't equal to privateState.playId
    privateState.playId = currentPlayId

    // set state
    privateState.playing = true
    privateState.broke = false

    const keyframes = data.keyframes
    const pauseData = this.getPauseData()

    if (options?.notEmitEvent !== true) {
      hooks.emit('play', { userAction: options?.userAction ?? true })
    }

    let playedFirstKeyframe = false

    const getPlayFromIndex = async () => {
      // play from index
      if (options?.playFromIndex !== undefined) return options.playFromIndex
      // play from id
      else if (options?.playFromId !== undefined) return this.data?.keyframes.findIndex((keyframe) => keyframe.id === options.playFromId)
      // play from pause position
      else if (pauseData?.keyframeId) {
        const pausedKeyframe = this.data?.keyframes.find((keyframe) => keyframe.id === pauseData.keyframeId)
        // restore paused state
        if (pauseData?.fiveState) await this.move(pauseData.fiveState, { moveEffect: privateState.moveToFirstPanoEffect })
        if (pausedKeyframe) {
          if (pausedKeyframe.data.effect === 'Move') return pausedKeyframe.index
          else if (pausedKeyframe.data.effect === 'Rotate') {
            const duration = pauseData.duration !== undefined ? pauseData.duration * (1 - pauseData.playedProgress) : undefined
            await this.playKeyframe(pausedKeyframe, { duration })
            playedFirstKeyframe = true
            // playFromIndex += 1 cause played last part of paused keyframe
            return pausedKeyframe.index + 1
          }
        }
      }
    }

    const playFromIndex = await getPlayFromIndex()

    this.clearPauseData()

    // play keyframes
    for (const keyframe of keyframes) {
      if (privateState.broke || !state.playing || !privateState.playing) return
      if (currentPlayId !== privateState.playId) return
      // jump to start keyframe
      if (playFromIndex !== undefined && keyframe.index < playFromIndex) continue
      // play single keyframe
      try {
        hooks.emit('playIndexChange', keyframe.index, keyframe)
        await this.playKeyframe(keyframe, {
          moveEffect: playedFirstKeyframe === false ? privateState.moveToFirstPanoEffect : undefined,
          duration: 800,
        })
        if (keyframe.stay) await sleep(keyframe.stay)
        if (playedFirstKeyframe === false) playedFirstKeyframe = true
      } catch (error) {
        return Promise.resolve('broke')
        // if think the play be interupted by five gesture is an error, return Promise.reject(error)
        // return Promise.reject(error)
      }
    }

    if (state.playing && currentPlayId === privateState.playId) {
      this.setState({ playing: false }, { userAction: false })
      hooks.emit('end')
      this.clearPauseData()
    }
  }

  /**
   * @description: Pause and record pause state
   */
  private handlePause(options?: { userAction?: boolean; notEmitEvent?: true }) {
    const { state, privateState, hooks } = this
    state.playing = false
    if (privateState.playing === false) return
    privateState.playing = false
    this.setPauseData()
    if (!privateState.broke) this.forceInteruptUpdateCamera()

    if (options?.notEmitEvent !== true) {
      hooks.emit('pause', { userAction: options?.userAction ?? true })
    }
  }

  /**
   * @description Play single keyframe
   */
  private async playKeyframe(keyframe: CruiseKeyframe, params?: { duration?: number; moveEffect?: MoveEffect }) {
    const { privateState } = this

    if (this.privateState.currentPlayKeyframe?.keyframe.id !== keyframe.id) this.privateState.currentPlayKeyframe = { keyframe }

    privateState.currentPlayQueue.push(this.getPlayPromise(keyframe, params))

    return this.actionPromiseQueue()
  }

  /**
   * @description: listen interupted by five gesture
   */
  private addInterruptListener(callback: () => void) {
    const wantsChangeModeHandler = () => {
      if (!this.privateState.modeChanging) callback()
    }
    const gestureHandler = callback

    this.five.once('gesture', gestureHandler)
    this.five.once('wantsChangeMode', wantsChangeModeHandler)
    return () => {
      this.five.off('gesture', gestureHandler)
      this.five.once('wantsChangeMode', wantsChangeModeHandler)
    }
  }

  /**
   * @description: getPlayPromise
   */
  private async getPlayPromise(keyframe: CruiseKeyframe, params?: { duration?: number; moveEffect?: MoveEffect }) {
    const data = keyframe.data
    const duration =
      params?.duration ?? (keyframe.start !== undefined && keyframe.end !== undefined ? keyframe.end - keyframe.start : undefined)
    if (!data) return
    return new Promise<void>((resolve, reject) => {
      let fulfilled = false
      this.addInterruptListener(() => {
        if (fulfilled) return
        this.hooks.emit('broke')
        this.privateState.broke = true
        this.setState({ playing: false })
        fulfilled = true
        return reject(new Error('play is interupted'))
      })
      try {
        if (fulfilled) return
        const res = () => {
          resolve()
          fulfilled = true
        }
        switch (data.effect) {
          case 'Move':
            this.move(data, params).then(res)
            break
          case 'Rotate':
            this.rotate(data, params).then(res)
            break
          default:
            this.rotate(data, params).then(res)
        }
      } catch (e) {}
    })
  }

  /**
   * @description Action promise queue in sequence
   */
  private async actionPromiseQueue(): Promise<void> {
    const { privateState } = this
    return new Promise<void>((resolve, reject) => {
      if (privateState.currentPlayQueue.length === 0) {
        resolve()
        return
      }
      const promise = privateState.currentPlayQueue.shift()
      if (!promise) {
        resolve()
        return
      }
      promise.then(resolve, reject)
    }).then(() => {
      if (privateState.currentPlayQueue.length === 0) return Promise.resolve()
      return this.actionPromiseQueue()
    })
  }

  /**
   * @description Action move keyframe
   */
  private async move(data: Partial<CruiseData>, params?: { duration?: number; moveEffect?: MoveEffect }) {
    if (data.mode && data.mode !== this.five.currentMode) {
      await this.changeMode(data)
    } else if (data.panoIndex !== this.five.panoIndex) {
      await this.changePano(data, params)
    } else {
      return Promise.resolve()
    }
    // await updateCamera(data)
  }

  /**
   * @description Action rotate keyframe
   */
  private async rotate(data: Partial<CruiseData>, params?: { duration?: number; moveEffect?: MoveEffect }) {
    if (data.mode && data.mode !== this.five.currentMode) {
      await this.changeMode({ mode: data.mode, panoIndex: data.panoIndex })
    } else if (data.panoIndex && data.panoIndex !== this.five.panoIndex) {
      return await this.changePano(data, params)
    }
    await this.updateCamera(data, params?.duration)
  }

  /**
   * @description Update five camera
   */
  private async updateCamera(data: Partial<Omit<Pose, 'offset'>> & { rotateSpeed?: number }, paramsDuration = 800) {
    const { five, privateState, state } = this
    let originDuration = paramsDuration
    const speed = (() => {
      const speedConfig = state.config?.speedConfig
      const speedValue = data.rotateSpeed ?? speedConfig?.rotateSpeed
      if (speedConfig?.rotateSpeedUnit === undefined) return speedValue
      if (speedValue !== undefined) {
        return speedConfig.rotateSpeedUnit === 'rad/ms' ? speedValue : speedValue / 1000
      }
    })()
    if (speed) {
      const coordinates1 = this.five.getCurrentState()
      const coordinates2 = data as any
      const angle = coordinatesAngle(coordinates1, coordinates2)
      originDuration = angle / speed
    }

    if (privateState.currentPlayKeyframe) privateState.currentPlayKeyframe.originDuration = originDuration

    const duration = this.getSpeededDuration(originDuration)

    return new Promise<void>((resolve) => {
      safeCall(() => five.updateCamera(data, duration))
      setTimeout(() => resolve(), duration)
    })
  }

  /**
   * @description: Change five pano
   */
  private async changePano(data: Partial<CruiseData>, params?: { duration?: number; moveEffect?: MoveEffect }) {
    const { five, privateState, state } = this
    if (typeof data.panoIndex !== 'number') return
    if (data.panoIndex === five.panoIndex) return
    const mode = five.getCurrentState().mode
    const willChangeMode = five.getCurrentState().mode !== 'Panorama'
    if (willChangeMode) this.privateState.modeChanging = true
    let originDuration = params?.duration ?? 800
    const speed = (() => {
      const speedConfig = state.config?.speedConfig
      const speedValue = data.moveSpeed ?? speedConfig?.moveSpeed
      if (speedConfig?.moveSpeedUnit === undefined) return speedValue
      if (speedValue !== undefined) {
        return speedConfig.moveSpeedUnit === 'm/ms' ? speedValue : speedValue / 1000
      }
    })()
    if (speed && typeof five.panoIndex === 'number' && typeof data.panoIndex === 'number') {
      const postion1 = five.work.observers[five.panoIndex]!.position
      const postion2 = five.work.observers[data.panoIndex]!.position
      const distance = postion1.distanceTo(postion2)
      originDuration = distance / speed
    }
    if (privateState.currentPlayKeyframe) privateState.currentPlayKeyframe.originDuration = originDuration
    const duration = this.getSpeededDuration(originDuration)

    await new Promise<void>((resolve) => {
      five.moveToPano(data.panoIndex!, {
        latitude: data.latitude,
        longitude: data.longitude,
        fov: data.fov,
        duration,
        effect: params?.moveEffect ?? this.state.config?.moveEffect ?? data.moveEffect,
        moveCancelCallback: () => resolve(),
        moveEndCallback: () => resolve(),
      })
      // 兼容five bug：模型走点不会触发 moveEndCallback
      if (willChangeMode) five.once('panoArrived', () => resolve())
    })

    if (willChangeMode) this.privateState.modeChanging = false
  }

  /**
   * @description: Change play speed
   */
  private changeSpeed(speed: number, userAction = true) {
    const { state, privateState, hooks } = this
    const { currentPlayKeyframe } = privateState
    hooks.emit('speedChange', speed, { userAction })

    if (state.playing && currentPlayKeyframe) {
      try {
        const duration =
          currentPlayKeyframe.originDuration !== undefined ? currentPlayKeyframe.originDuration * (1 - this.getProgress()) : undefined
        const promise = this.playKeyframe(currentPlayKeyframe.keyframe, { duration })
        privateState.currentPlayQueue.push(promise)
      } catch (e) {}
    }
  }

  /**
   * @description Get duration by speed
   */
  private getSpeededDuration(duration: number) {
    return duration / this.state.speed
  }

  /**
   * @description Get ratate progress
   */
  private getProgress() {
    return (this.five as any).controller.cameraMotion.progress
  }

  /**
   * @description Change five mode
   */
  private async changeMode(data: Partial<State>, duration?: number) {
    if (data.mode && data.mode !== this.five.currentMode) {
      this.privateState.modeChanging = true
      await this.five.changeMode(data.mode, data, duration)
      this.privateState.modeChanging = false
    }
  }

  /**
   * @description Force interupt five updateCamera
   */
  private forceInteruptUpdateCamera() {
    this.five.updateCamera({}, 0)
  }

  private getPauseData() {
    if (this.data?.keyframesId) return pauseDataMap.get(this.data?.keyframesId)
  }

  /**
   * @description Set pause data
   */
  private setPauseData() {
    if (this.data?.keyframesId)
      return pauseDataMap.set(this.data?.keyframesId, {
        keyframeId: this.privateState.currentPlayKeyframe?.keyframe.id,
        fiveState: this.five.getCurrentState(),
        duration: this.privateState.currentPlayKeyframe?.originDuration,
        playedProgress: this.getProgress(),
      })
  }

  /**
   * @description Clear pause data
   */
  private clearPauseData() {
    if (this.data?.keyframesId) return pauseDataMap.delete(this.data?.keyframesId)
  }

  /**
   * @description: Restore state that before loaded
   */
  private clear() {
    this.clearPauseData()
    this.privateState.currentPlayKeyframe = null
  }

  // TODO
  private handleDispose() {
    this.setState({ playing: false })
    this.clearPauseData()
    this.clear()
    this.GuideLine?.dispose()
    this.GuideLine = undefined
    this.privateState.disposers?.forEach((d) => d?.())
  }

  /**
   * @description Action function if plugin is enable
   */
  private actionIfStateIsEnabled<T = any>(func: () => T, options?: { warnLog?: true }) {
    if (this.state.enabled) return func()
    else {
      if (options?.warnLog) disableWarnLog()
    }
  }

  /**
   * @description: Wait for five work ready
   */
  private async waitFiveLoaded() {
    return new Promise<void>((resolve) => {
      if (this.five.work) {
        resolve()
        return
      }
      this.five.once('loaded', () => {
        resolve()
      })
    })
  }

  private setFiveLinearUpdateCamera() {
    if (!this.privateState.fiveOriginGetProgress) return
    ;(this.five as any).controller.cameraMotion.getProgress = (time: number) => {
      const cameraMotion = (this.five as any).controller.cameraMotion
      const deltaTime = time - cameraMotion.startTime
      if (deltaTime < 0) return 0
      if (deltaTime >= cameraMotion.duration) return 1
      return 1 - linerValue(1, cameraMotion.startVelocity, cameraMotion.duration, deltaTime)
    }
  }

  private setFiveOriginUpdateCamera() {
    if (!this.privateState.fiveOriginGetProgress) return
    ;(this.five as any).controller.cameraMotion.getProgress = this.privateState.fiveOriginGetProgress
  }
}
