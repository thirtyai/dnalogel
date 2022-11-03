import { BaseController } from '../Base/BaseController'
import * as THREE from 'three'
import { calculateThreeMouse, getMouseRaycaster } from '../utils'
import type { MoveHelperAbstract } from '../Helper'
import type { Direction } from '../typings'
import getPoint from '../utils/getPoint'

export class MoveController<T extends MoveHelperAbstract = MoveHelperAbstract> extends BaseController<T> {
  private startInfo?: {
    // 开始位置
    startVectorProject: THREE.Vector3
    // 轴
    directionVector: THREE.Vector3
    //
    plane: THREE.Plane
  }

  public constructor(...params: ConstructorParameters<typeof BaseController<T>>) {
    super(...params)

    // add hover listener
    const helper = this.helperObject3D
    this.hoverListener([helper.xArrow, helper.yArrow, helper.zArrow])

    const dragStart = this.dragStart.bind(this)
    const dragging = this.dragging.bind(this)
    const dragEnd = this.dragEnd.bind(this)
    this.domEvents.addEventListener(this.helperObject3D, 'mousedown', dragStart)
    document.addEventListener('mousemove', dragging)
    document.addEventListener('mouseup', dragEnd)
  }

  /**
   * @description: 拖动开始，找出拖的Direction
   */
  private dragStart(params: { intersect: THREE.Intersection }): void {
    if (this.isDragging) return

    const intersect = params?.intersect

    if (!intersect) return this.dragEnd()

    const draggingDirection = (intersect?.object as any).direction as Direction

    if (!draggingDirection) return this.dragEnd()

    const directionX = new THREE.Vector3(1, 0, 0).applyQuaternion(this.helperObject3D.quaternion)
    const directionY = new THREE.Vector3(0, 1, 0).applyQuaternion(this.helperObject3D.quaternion)
    const directionZ = new THREE.Vector3(0, 0, 1).applyQuaternion(this.helperObject3D.quaternion)

    const directionVector = (() => {
      switch (draggingDirection) {
        case 'x':
          return directionX
        case 'y':
          return directionY
        case 'z':
          return directionZ
      }
    })()

    const planeNormal = (() => {
      switch (draggingDirection) {
        case 'x':
        case 'y':
          return directionZ
        case 'z':
          return directionX
      }
    })()

    const startIntersect = intersect.point.clone()

    const plane = new THREE.Plane()

    plane.setFromNormalAndCoplanarPoint(planeNormal, startIntersect)

    this.startInfo = { startVectorProject: startIntersect.clone().projectOnVector(directionVector), directionVector, plane }

    // 隐藏其他箭头
    this.helperObject3D.showDraggingHelper([draggingDirection])
    this.hooks.emit('moveStart')
    this.isDragging = true
    console.log('%c MoveController dragStart', 'color: #e5af2e')
  }

  private dragging(point: { x: number; y: number }): false | void {
    if (!this.isDragging) return
    if (!this.startInfo) return

    const ray = getMouseRaycaster(this.camera, point, this.container)
    if (!ray) return this.dragEnd()

    console.log(`%c RotateController dragging`, 'color: #49de1b')
    this.move(ray)

    return false
  }

  private move(raycaster: THREE.Raycaster) {
    if (!this.startInfo) return this.dragEnd()

    const { plane, directionVector, startVectorProject } = this.startInfo
    const object = this.originObject3D

    const planeIntersection = raycaster.ray.intersectPlane(plane, new THREE.Vector3())
    if (!planeIntersection) return

    const currentVectorProject = planeIntersection.clone().projectOnVector(directionVector)
    const offsetVector = currentVectorProject.clone().sub(startVectorProject)

    // 移动transform
    const transform = new THREE.Matrix4()
    transform.setPosition(offsetVector)

    object.applyMatrix4(transform)
    this.helperObject3D.applyMatrix4(transform)
    startVectorProject.copy(currentVectorProject)
    this.hooks.emit('positionUpdate', { matrix4: transform })
  }

  private dragEnd(): void {
    if (!this.isDragging) return
    console.log('%c MoveController dragEnd', 'color: #e94e4e')
    // 拖动结束，重置currentDraggingDirection
    this.startInfo = undefined
    this.isDragging = false
    // 显示所有箭头
    this.helperObject3D.show()
    this.hooks.emit('moveEnd')
    return
  }
}
