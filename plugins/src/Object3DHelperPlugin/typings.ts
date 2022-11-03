export interface Object3DHelperPluginState {
  enabled: boolean
  visible: boolean
  disposed: boolean
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Object3DHelperPluginEventMap = {
  show: (options?: { userAction?: boolean }) => void
  hide: (options?: { userAction?: boolean }) => void
  enable: (options?: { userAction?: boolean }) => void
  disable: (options?: { userAction?: boolean }) => void
  dispose: () => void
  stateChange: (params: { state: Object3DHelperPluginState; prevState?: Object3DHelperPluginState }) => void
}
