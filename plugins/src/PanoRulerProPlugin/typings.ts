export type PanoRulerProPluginDatas = { data: PanoRulerProPluginData[]; version: number } // 插件传入数据

export interface PanoRulerProPluginData {
  panoIndex: number // 全景点位
  roomName: string // 房间名称
  lines: Line[] // 当前全景点位下所有线的集合
}

interface Line {
  start: number[] // 线的起点位置
  end: number[] // 线的终点位置
  state: boolean // 线的虚实状态，true为实线，false为虚线
  children?: Line[]
}

export interface PanoRulerProPluginOptions {
  distanceText?: (distance: number) => string
  className?: string
}

export interface PanoRulerProPluginState {
  enabled: boolean
  loaded: boolean
  options: PanoRulerProPluginOptions
}

export interface PanoRulerProPluginParameterType {
  data?: PanoRulerProPluginDatas
  options?: PanoRulerProPluginOptions
}

export interface PanoRulerProPluginExportType {
  enable: () => void
  disable: () => void
  load: (serverData: PanoRulerProPluginDatas) => void
  state: PanoRulerProPluginState
}

export interface RulerItemProp {
  width: number
  left: number
  top: number
  rotateDeg: number
  state: boolean
  children: any[]
  labelOffset: number
  labelElement: string
  visible: boolean
}
