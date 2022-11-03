import type { PanoTagPluginController } from '../index'
import type { ContentType, DimensionType, TagId, PlaneTag, PointType, Tag, Tag2D, Tag3D } from '../typings'
import type * as BasePlugin from '../../base/BasePlugin'
import type TagContentSvelte from '../Components/Tag/index.svelte'
import type { Vector3 } from 'three'
import type { Create3DDomContainerReturnType } from '../../CSS3DRenderPlugin'
import type { Writable } from 'svelte/store'
import type { Subscribe } from '@realsee/five'

export type PanoIndex = number
export type WorkCode = string

export type Hooks = InstanceType<typeof PanoTagPluginController>['hooks']

type NonNullable<T> = T extends null | undefined | void ? never : T

export interface State extends BasePlugin.State {}

export interface AddTagConfig {
  withAnimation?: boolean
}

export interface TemporaryState {
  visible?: boolean
}

export interface EventMap extends BasePlugin.EventMap<State> {
  click: (
    params: { event: MouseEvent & { currentTarget: EventTarget } } & (
      | { target: 'TagPoint'; tag: PointTagElement }
      | { target: 'TagContent'; tag: TagElement }
      | { target: 'AudioTagPlayIcon'; tag: TagElement; audioInstance: HTMLAudioElement }
    ),
  ) => void

  playStateChange: (params: { event: Event; state: 'playing' | 'paused'; tag: TagElement; mediaInstance: HTMLMediaElement }) => void

  exposure: (params: { id: TagId; type: 'start' | 'end' }) => void

  show: (options: { userAction: boolean; withAnimation: boolean }) => void

  hide: (options: { userAction: boolean; withAnimation: boolean }) => void

  enable: (options: { userAction: boolean }) => void

  disable: (options: { userAction: boolean }) => void
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TagEvents = {
  unfolded: () => void
  folded: () => void
  show: () => void
  hide: () => void
}

export interface TagCache {
  visible?: boolean
  unfolded?: boolean
  minimumDistanceResult?: boolean // 最近距离计算后的缓存
  distance?: number // panoIndex 到标签点的距离
  angle?: number // 3D标签中 「标签所在平面或垂直于标签法线的平面」 与 「摄像机到标签点或中心点的向量」 的夹角
}
export type TagElement<
  C extends ContentType = ContentType,
  P extends PointType = PointType,
  D extends DimensionType = DimensionType,
  CustomDataType extends Object = {},
> = Tag<C, P, D, CustomDataType> &
  Partial<{
    pointTagStyle: {
      leftPercent: number
      topPercent: number
    }
    clickable: boolean
    state: {
      visible?: boolean
      unfolded: boolean
    }
    temporaryState: {
      visible: boolean
    }
    tag3DContentSvelte: {
      svelteApp: TagContentSvelte
      domContainer: NonNullable<Create3DDomContainerReturnType>
      initialNormal: Vector3
      currentNormal: Vector3
    }
    hooks: Subscribe<TagEvents>
  }>

export type MediaStore = Writable<{
  currentMediaUrl: string
}>

export type PointTagElement<C extends ContentType = ContentType> = TagElement<C, PointType.PointTag, DimensionType>
export type PlaneTagElement<C extends ContentType = ContentType> = TagElement<C, PointType.PlaneTag, DimensionType.Three>
export type Tag2DElement<C extends ContentType = ContentType> = TagElement<C, PointType.PointTag, DimensionType.Two>
export type Tag3DElement<C extends ContentType = ContentType> = TagElement<C, PointType.PointTag, DimensionType.Three>
