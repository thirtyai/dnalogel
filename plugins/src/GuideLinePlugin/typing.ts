import type GuideLinePlugin from '.'
import type * as BasePluginWithData from '../base/BasePluginWithData'

export interface Route {
  panoIndexList: number[]
  arrowTextureUrl?: string
  skipPanoIndexMesh?: boolean
  unitWidth?: number
  unitHeight?: number
}

export interface PluginData {
  routes: Route[]
}

export interface PluginServerData extends BasePluginWithData.ServerData {
  data: PluginData
}

export interface PluginState extends BasePluginWithData.State {
  visible: boolean
  disposed: boolean
}

export interface EventMap extends BasePluginWithData.EventMap<PluginState, PluginData> {
  show: (options: { userAction: boolean }) => void
  hide: (options: { userAction: boolean }) => void
  enable: (options: { userAction: boolean }) => void
  disable: (options: { userAction: boolean }) => void
}

export type GuideLinePluginExportType = ReturnType<typeof GuideLinePlugin>
