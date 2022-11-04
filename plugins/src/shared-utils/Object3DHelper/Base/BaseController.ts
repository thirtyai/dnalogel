import * as THREE from 'three'
import { Subscribe } from '../../Subscribe'
import type { HelperEventMap } from '../typings'
import type { BaseHelper } from './BaseHelper'
import DomEvents from '../utils/threex/domevents'
import { notNil } from '../../isNil'
import { CSS3DObjectPlus } from '../../../CSS3DRenderPlugin/utils/CSS3DObjectPlus'

export let originOpacity: {
  opacity: number
} | null = null

export abstract class BaseController<T extends BaseHelper = BaseHelper, K extends THREE.Object3D = THREE.Object3D> {
  public hooks: Subscribe<HelperEventMap> = new Subscribe<HelperEventMap>()
  public helperObject3D: T
  public originObject3D: K
  protected camera: THREE.Camera
  protected model: THREE.Object3D
  protected scene: THREE.Scene
  protected container: HTMLElement
  protected domEvents: DomEvents
  protected isDragging = false
  protected onRender: () => void
  protected enabled = false

  public constructor(
    camera: THREE.Camera,
    model: THREE.Object3D,
    originObject3D: K,
    helperObject3D: T,
    container: HTMLElement,
    scene: THREE.Scene,
    onRender?: () => void,
  ) {
    this.camera = camera
    this.model = model
    this.originObject3D = originObject3D
    this.helperObject3D = helperObject3D
    this.container = container
    this.scene = scene
    this.domEvents = new DomEvents(camera, container)
    this.onRender = onRender ?? (() => {})
    this.initialHelperPosition()
    this.initialHelperQuaternion()
    this.enable()
  }

  public initialHelperPosition() {
    this.helperObject3D.updatePosition()
  }

  public initialHelperQuaternion() {
    this.helperObject3D.updateQuaternion()
  }

  public enable() {
    if (this.enabled) return
    this.enabled = true
    this.scene.add(this.helperObject3D)
    this.render()
  }

  public disable() {
    if (!this.enabled) return
    this.enabled = false
    this.scene.remove(this.helperObject3D)
    this.render()
  }

  public show() {
    this.helperObject3D.show()
    this.render()
  }

  public hide() {
    this.helperObject3D.hide()
    this.render()
  }

  public dispose() {
    this.helperObject3D.dispose()
    this.scene.remove(this.helperObject3D)
    this.render()
  }

  public setOpacity(opacity: number) {
    this.setOriginOpacityProperty()
    const originObject3D = this.originObject3D
    if (originObject3D instanceof THREE.Mesh) {
      originObject3D.material.opacity = opacity
    }
    if ((originObject3D as any).isCSS3DObjectPlus) {
      const o = originObject3D as any as InstanceType<typeof CSS3DObjectPlus>
      o.container.style.opacity = opacity.toString()
    }
    this.render()
  }

  public restoreOpacity() {
    if (originOpacity === null) return
    const originObject3D = this.originObject3D
    if (originObject3D instanceof THREE.Mesh) {
      originObject3D.material.opacity = originOpacity.opacity
    }
    if ((originObject3D as any).isCSS3DObjectPlus) {
      const o = originObject3D as any as InstanceType<typeof CSS3DObjectPlus>
      o.container.style.opacity = originOpacity.opacity.toString()
    }
    this.render()
  }

  public setOriginOpacityProperty() {
    if (originOpacity === null) {
      const originObject3D = this.originObject3D
      if (originObject3D instanceof THREE.Mesh) {
        originOpacity = {
          opacity: originObject3D.material.opacity,
        }
      }
      if (originObject3D instanceof CSS3DObjectPlus) {
        originOpacity = {
          opacity: originObject3D.container.style.opacity ?? 1,
        }
      }
      if ((originObject3D as any).isCSS3DObjectPlus) {
        const o = originObject3D as any as InstanceType<typeof CSS3DObjectPlus>
        originOpacity = {
          opacity: Number(o.container.style.opacity ?? 1),
        }
      }
    }
  }

  public updateHelperPosition() {
    this.helperObject3D.updatePosition()
  }

  public updateHelperQuaternion() {
    this.helperObject3D.updateQuaternion()
  }

  // public setHelperPosition(position: THREE.Vector3) {
  //   this.helperObject3D.setPosition(position)
  // }

  public applyHelperMatrix4(matrix4: THREE.Matrix4) {
    this.helperObject3D.applyMatrix4(matrix4)
  }

  public applyHelperQuaternion(quaternion: THREE.Quaternion, origin: THREE.Vector3) {
    this.helperObject3D.applyHelperQuaternion(quaternion, origin)
  }

  public applyHelperScaleMatrix4(matrix4: THREE.Matrix4, params?: { origin?: THREE.Vector3; helperOrigin?: THREE.Vector3 }) {
    this.helperObject3D.applyHelperScaleMatrix4(matrix4, params)
  }

  public onWantsTapGesture = (raycaster: THREE.Raycaster): false | void => {
    const selectedObject = this.getIntersectObject(raycaster)
    if (selectedObject) return false
    return
  }

  public onWantsGesture(type: 'press' | 'pan' | string, pointers: { x: number; y: number }[], final: boolean): false | void {
    if (this.isDragging) return false
  }

  protected render() {
    this.onRender()
  }

  protected hoverListener(
    object3D: THREE.Object3D | undefined | THREE.Group | (THREE.Object3D | undefined | THREE.Group)[],
    hoverColor: THREE.Color | string | number = 0xffffff,
    hoverOpacity = 1,
  ): () => void {
    const objects = (Array.isArray(object3D) ? object3D : [object3D]).filter(notNil)
    const disposers: (() => void)[] = []
    for (const object of objects) {
      if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
        const meshes =
          object instanceof THREE.Group ? (object.children.filter((child) => child instanceof THREE.Mesh) as THREE.Mesh[]) : [object]
        meshes.forEach((mesh) => {
          ;(mesh as any)['__originalColor__'] = mesh.material.color.clone()
          ;(mesh as any)['__originalOpacity__'] = mesh.material.opacity
        })

        const setHoverColor = () => {
          meshes.forEach((mesh) => {
            mesh.material.color.set(hoverColor)
            mesh.material.opacity = hoverOpacity
          })
          this.render()
        }
        const resetColor = () => {
          meshes.forEach((mesh) => {
            mesh.material.color.copy((mesh as any)['__originalColor__'])
            mesh.material.opacity = (mesh as any)['__originalOpacity__']
          })
          this.render()
        }

        const handleMouseover = () => {
          if (this.isDragging) return
          setHoverColor()
        }
        const handleMouseout = () => {
          if (this.isDragging) return
          resetColor()
        }

        for (const mesh of meshes) {
          this.domEvents.addEventListener(mesh, 'mouseover', handleMouseover)
          this.domEvents.addEventListener(mesh, 'mouseout', handleMouseout)
          this.hooks.on('moveStart', setHoverColor)
          this.hooks.on('moveEnd', resetColor)
          this.hooks.on('rotateEnd', resetColor)
          disposers.push(() => {
            this.domEvents.removeEventListener(mesh, 'mouseover', handleMouseover)
            this.domEvents.removeEventListener(mesh, 'mouseout', handleMouseout)
            this.hooks.off('moveStart', setHoverColor)
            this.hooks.off('moveEnd', resetColor)
            this.hooks.off('rotateEnd', resetColor)
          })
        }
      }
    }
    return () => disposers.forEach((disposer) => disposer?.())
  }

  private getIntersectObject(raycaster: THREE.Raycaster) {
    const cameraPosition = this.camera.position
    const object = this.helperObject3D
    // 如果当前没有模型，则不存在模型被点击
    if (!object) return undefined

    // 如果存在模型，需要判断模型与射线的交点和 model 与射线的交点的远近
    let objectIntersection: THREE.Intersection | undefined
    const intersection = raycaster.intersectObject(object, true)[0]
    if (!intersection) return undefined
    objectIntersection = intersection
    objectIntersection.object = object
    if (!objectIntersection) return undefined

    // 如果 five model intersection 更近，返回 undefined
    if ((this.model as any)['intersectRaycaster']) {
      const modelIntersection = (this.model as any).intersectRaycaster(raycaster)[0]
      if (modelIntersection && modelIntersection.point.distanceTo(cameraPosition) < objectIntersection.point.distanceTo(cameraPosition))
        return undefined
    }

    return objectIntersection.object
  }
}
