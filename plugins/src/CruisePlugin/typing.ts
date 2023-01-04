import type { MovePanoOptions, Pose, State } from '@realsee/five'
import type CruisePlugin from '.'
import type * as BasePluginWithData from '../base/BasePluginWithData'
import type { Route } from '../GuideLinePlugin/typing'

type FivePoseAndState = Partial<Pose> & Partial<State>

export type MoveEffect = MovePanoOptions['effect']

export type CruiseData = {
  /** 移动/旋转 */
  effect: 'Move' | 'Rotate'
  /** five走点动画 */
  moveEffect?: MoveEffect
  /** 移动速度 */
  moveSpeed?: number
  /** 旋转速度 */
  rotateSpeed?: number
} & FivePoseAndState

export interface CruiseKeyframe {
  id: string
  index: number
  moveIndex: number
  stay?: number
  start?: number
  end?: number
  data: CruiseData
}

export interface PluginData {
  keyframesId: string
  keyframes: CruiseKeyframe[]
}

export interface PluginServerData extends BasePluginWithData.ServerData {
  data:
    | {
        keyframes: {
          uuid?: string
          id?: string
          start?: number
          end?: number
          data: CruiseData
        }[]
        /** for ts check, no care */
        panoIndexList?: undefined
        /** for ts check, no care */
        moveEffect?: undefined
        /** for ts check, no care */
        moveType?: undefined
        /** for ts check, no care */
        moveToFirstPanoEffect?: undefined
        /** for ts check, no care */
        moveToFirstPanoDuration?: undefined
        /** for ts check, no care */
        stay?: undefined
      }
    | {
        /** 点位列表 */
        panoIndexList: number[]
        /** five走点动画 */
        moveEffect?: MoveEffect
        /** 到第一个点的走点动画 / 续播到暂停处的走点动画 */
        moveToFirstPanoEffect?: MoveEffect
        /** 到第一个点的走点时长 / 续播到暂停处的走点时长 */
        moveToFirstPanoDuration?: number
        /** 漫游方式：justMove 为移动到指定点位，且朝向为下一个点的朝向；moveAndRotate 为先移动到指定点位且朝向不变，然后旋转到下一个点的朝向 */
        moveType?: 'justMove' | 'moveAndRotate'
        /** 停留时长 */
        stay?: number
        /** 传递给 GuildPlugin 的参数 */
        guildPluginOptions?: {
          route: Omit<Route, 'panoIndexList'>
        }
        /** for ts check, no care */
        keyframes?: undefined
      }
}

export interface PluginState extends BasePluginWithData.State {
  /** 是否可见 */
  visible: boolean
  /** 是否正在播放 */
  playing: boolean
  /** 是否销毁 */
  disposed: boolean
  /** 播放速度 */
  speed: number
  config?: {
    /** 速度配置 */
    speedConfig?: {
      /** 旋转速度 */
      rotateSpeed: number
      /** 旋转速度单位 */
      rotateSpeedUnit: 'rad/s' | 'rad/ms'
      /** 移动速度 */
      moveSpeed: number
      /** 移动速度单位 */
      moveSpeedUnit: 'm/s' | 'm/ms'
    }
    /** five 走点动画 */
    moveEffect?: MoveEffect
  }
}

export interface EventMap extends BasePluginWithData.EventMap<PluginState, PluginData> {
  /** 展示 */
  show: (options: { userAction: boolean }) => void
  /** 隐藏 */
  hide: (options: { userAction: boolean }) => void
  /** 开启 */
  enable: (options: { userAction: boolean }) => void
  /** 关闭 */
  disable: (options: { userAction: boolean }) => void
  /** 播放状态改变，playingState: playing 表示播放；pause 表示暂停 */
  playStateChange: (playingState: 'playing' | 'pause', options: { userAction: boolean }) => void
  /** 开始播放，相当于 playStateChange: ('playing') => void */
  play: (options: { userAction: boolean }) => void
  /** 暂停播放，相当于 playStateChange: ('pause') => void */
  pause: (options: { userAction: boolean }) => void
  /** 播放的帧改变，index表示开始播放第{index}个帧 */
  playIndexChange: (index: number, keyframe: CruiseKeyframe) => void
  /** 播放被手势操作打断，同时会触发 ”pause“ 事件 */
  broke: () => void
  /** 播放结束 */
  end: () => void
  /** 播放速度改变，speed表示播放速度 */
  speedChange: (speed: number, options: { userAction: boolean }) => void
}

export type CruisePluginExportType = ReturnType<typeof CruisePlugin>
