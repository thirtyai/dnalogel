import type * as THREE from 'three'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type HelperEventMap = {
  moveStart: () => void
  rotateStart: () => void
  scaleStart: () => void
  positionUpdate: (position: { matrix4?: THREE.Matrix4 } | undefined) => void
  rotateUpdate: (rotate: { quaternion?: THREE.Quaternion; origin: THREE.Vector3 } | undefined) => void
  scaleUpdate: (scale: { matrix4?: THREE.Matrix4; origin?: THREE.Vector3; helperOrigin: THREE.Vector3 } | undefined) => void
  moveEnd: () => void
  rotateEnd: () => void
  scaleEnd: () => void
}

export interface Object3DHelperState {
  enabled: boolean
  visible: boolean
  disposed: boolean
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Object3DHelperEventMap = {
  show: (options?: { userAction?: boolean }) => void
  hide: (options?: { userAction?: boolean }) => void
  enable: (options?: { userAction?: boolean }) => void
  disable: (options?: { userAction?: boolean }) => void
  dispose: () => void
  stateChange: (params: { state: Object3DHelperState; prevState?: Object3DHelperState }) => void
}
