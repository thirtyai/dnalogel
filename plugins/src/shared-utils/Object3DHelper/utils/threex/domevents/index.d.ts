import type * as THREE from 'three'

type EventName =
  | 'click'
  | 'dblclick'
  | 'mouseover'
  | 'mouseout'
  | 'mousemove'
  | 'mousedown'
  | 'mouseup'
  | 'contextmenu'
  | 'touchstart'
  | 'touchend'

declare class DomEvents {
  public constructor(camera: THREE.Camera, domElement: HTMLElement)

  public addEventListener<T extends EventName, K extends THREE.Object3D>(
    object: K,
    eventName: T,
    callback: (params: {
      type: T
      target: K
      origDomEvent: Event
      intersect: THREE.Intersection & { object: K }
      stopPropagation: () => void
    }) => void,
    useCapture?: boolean,
  ): void

  public removeEventListener(object: THREE.Object3D, eventName: EventName, callback: (params: any) => void, useCapture?: boolean): void
}

export default DomEvents
