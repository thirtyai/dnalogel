import { BaseController } from '../Base/BaseController'
import type { RotateHelperAbstract } from '../Helper'
import * as THREE from 'three'
import type { Direction } from '../typings'
import { getMouseRaycaster } from '../utils'

export class RotateController<T extends RotateHelperAbstract = RotateHelperAbstract> extends BaseController<T> {
  private startInfo?: {
    // 当前拖动的圆
    direction: Direction
    // 开始位置，旋转过程中会实时修改
    startVector: THREE.Vector3
    // 开始位置Vector，旋转过程中不会实时修改
    staticStartVector: THREE.Vector3
    // plane
    plane: THREE.Plane
    angleHelper: THREE.Object3D & {
      baseAxes: THREE.Vector3
      direction: Direction
    }
  }

  private lastRotation?: {
    angle: number
  }

  private rotations: {
    vector: THREE.Vector3
    // 旋转方向：正向：true，反向：false
    direction: boolean
  }[] = []

  private helperObject3DQuaternion = this.originObject3D.quaternion.clone()

  public constructor(...params: ConstructorParameters<typeof BaseController<T>>) {
    super(...params)

    // add hover listener
    const helper = this.helperObject3D
    this.hoverListener([helper.xyCircle, helper.xzCircle, helper.yzCircle])

    const dragStart = this.dragStart.bind(this)
    const dragging = this.dragging.bind(this)
    const dragEnd = this.dragEnd.bind(this)
    this.domEvents.addEventListener(this.helperObject3D, 'mousedown', dragStart)
    document.addEventListener('mousemove', dragging)
    document.addEventListener('mouseup', dragEnd)
  }

  public initialHelperQuaternion() {
    this.helperObject3D.updateAngleHelperQuaternion()
    this.helperObject3D.applyHelperQuaternion(this.originObject3D.quaternion)
  }

  /**
   * @description: 拖动开始，找出拖的Direction
   */
  private dragStart(params: { intersect: THREE.Intersection }): void {
    if (this.isDragging) return

    const intersect = params?.intersect

    if (!intersect) return this.dragEnd()

    const direction = (intersect?.object as any).direction as Direction

    if (!direction) return this.dragEnd()
    // 检查end

    this.helperObject3D.updateAngleHelperQuaternion()

    const startIntersect = intersect.point

    const rotateCenter = this.originObject3D.position.clone()
    const angleHelper = this.getAngleHelper(direction)

    // init tips
    this.setTipsAngle(0)
    const tipsPosition = startIntersect.clone()
    tipsPosition.y += 0.2
    this.setTipsPosition(tipsPosition)
    // end

    // init plane
    const directionX = new THREE.Vector3(1, 0, 0).applyQuaternion(this.helperObject3DQuaternion)
    const directionY = new THREE.Vector3(0, 1, 0).applyQuaternion(this.helperObject3DQuaternion)
    const directionZ = new THREE.Vector3(0, 0, 1).applyQuaternion(this.helperObject3DQuaternion)

    const directionVector = (() => {
      switch (direction) {
        case 'x':
          return directionX
        case 'y':
          return directionY
        case 'z':
          return directionZ
      }
    })()

    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(directionVector, startIntersect)

    // this.a && this.scene.remove(this.a)
    // const h = new THREE.PlaneHelper(plane, 1)
    // this.scene.add(h)
    // this.a = h
    // end

    // init startVectorProject
    const projectPoint = new THREE.Vector3()
    plane.projectPoint(startIntersect.clone(), projectPoint)
    const startVector = projectPoint.clone().sub(rotateCenter)
    // end

    // 计算开始角度
    const staticStartVector = startVector.clone()
    const startAngle = startVector.angleTo(angleHelper.baseAxes)
    this.setAngleHelperStart(direction, startAngle)
    this.setAngleHelperLength(direction, 0)
    this.rotations.push({ vector: startVector.clone(), direction: true })
    // end

    // this.scene.remove(this.a)
    // this.a = new THREE.PlaneHelper(plane, 10, 0xffff00)
    // this.scene.add(this.a)

    this.startInfo = { direction, startVector, staticStartVector, plane, angleHelper }

    this.helperObject3D.showDraggingHelper([direction])
    this.hooks.emit('rotateStart')
    this.isDragging = true
    console.log(`%c RotateController dragStart ${direction}`, 'color: #e5af2e')
  }

  private dragging(point: { x: number; y: number }): false | void {
    if (!this.isDragging) return

    const ray = getMouseRaycaster(this.camera, point, this.container)
    if (!ray) return this.dragEnd()

    console.log(`%c RotateController dragging ${this.startInfo?.direction}`, 'color: #49de1b')
    this.rotate(ray)

    return false
  }

  private rotate(raycaster: THREE.Raycaster) {
    if (!this.startInfo) return this.dragEnd()

    const { startVector, plane, angleHelper, staticStartVector, direction } = this.startInfo
    const object = this.originObject3D

    const currentIntersectPoint = raycaster.ray.intersectPlane(plane, new THREE.Vector3())
    if (!currentIntersectPoint) return

    const rotateCenter = object.position.clone()
    const projectPoint = new THREE.Vector3()
    plane.projectPoint(currentIntersectPoint.clone(), projectPoint)

    const currentVector = projectPoint.clone().sub(rotateCenter)

    // 计算当前角度
    if (startVector.angleTo(currentVector) === 0) return

    if (this.lastRotation === undefined) this.lastRotation = { angle: 0 }

    if (this.rotations.length === 0) return

    const rotationDirection = (() => {
      if (this.rotations.length === 1) {
        return currentVector.angleTo(angleHelper.baseAxes) > staticStartVector.angleTo(angleHelper.baseAxes)
      } else {
        /**
         * 通过记录上两次旋转时的vectorEnd和方向，来计算当前旋转的方向
         */
        const lr = this.rotations[this.rotations.length - 1]! // last rotation
        const llr = this.rotations[this.rotations.length - 2]! // last last rotation
        const currentToLLR = currentVector.angleTo(llr.vector)
        const currentToLR = currentVector.angleTo(lr.vector)
        const lrToLLR = lr.vector.angleTo(llr.vector)
        if (lrToLLR === 0 || currentToLR === 0 || currentToLLR === 0) return
        /** example:
         *    'current lr llr' mains:
         *
         *    currentVector  lr  llr
         *             \     |    /
         *              \    |   /
         *               \   |  /
         *                \  | /
         *                 \ |/
         *          rotation center
         *
         * 1. 如果 currentVector 到 llr 角度大于 currentVector 到 lr 角度，说明当前旋转方向与lr相同
         * 2. 如果 currentVector 在 llr 和 lr 中间，说明当前旋转方向与lr相反
         * 3. 如果 currentVector 到 lr 角度大于 currentVector 到 llr 角度，说明当前旋转方向与lr相反
         */
        // 1. current lr llr 或 llr lr current
        if (currentToLLR > currentToLR && currentToLLR > lrToLLR) {
          return lr.direction
        }
        // 2. lr current llr 或 llr current lr
        if (currentToLLR < lrToLLR && currentToLR < lrToLLR) {
          return !lr.direction
        }
        // 3. lr llr current 或 current llr lr
        if (currentToLLR < currentToLR && currentToLR > lrToLLR) {
          return !lr.direction
        }
      }
      return
    })()
    if (rotationDirection === undefined) return console.warn('rotationDirection is undefined')
    this.rotations.push({ vector: currentVector, direction: rotationDirection })
    this.rotations = this.rotations.slice(-2) // 只保留后两个
    this.lastRotation.angle = this.lastRotation.angle + currentVector.angleTo(startVector) * (rotationDirection ? 1 : -1)
    this.setAngleHelperLength(direction, this.lastRotation.angle)
    this.setTipsAngle((this.lastRotation.angle / Math.PI) * 180)
    // end

    const quaternion = new THREE.Quaternion().setFromUnitVectors(startVector.clone().normalize(), currentVector.clone().normalize())
    object.applyQuaternion(quaternion)
    this.helperObject3D.applyHelperQuaternion(quaternion)
    this.helperObject3DQuaternion.premultiply(quaternion)
    this.hooks.emit('rotateUpdate', { quaternion, origin: rotateCenter })
    this.startInfo.startVector = currentVector
  }

  private dragEnd(): void {
    if (!this.isDragging) return
    console.log('%c RotateController dragEnd', 'color: #e94e4e')
    // 拖动结束，重置
    this.startInfo = undefined
    this.isDragging = false
    this.lastRotation = undefined
    this.rotations = []
    // 显示所有
    this.helperObject3D.show()
    this.hooks.emit('rotateEnd')
    return
  }

  private getAngleHelper(direction: Direction) {
    switch (direction) {
      case 'x':
        return this.helperObject3D.xAngleHelper
      case 'y':
        return this.helperObject3D.yAngleHelper
      case 'z':
        return this.helperObject3D.zAngleHelper
    }
  }

  private setAngleHelperStart(direction: Direction, start: number) {
    const angleHelper = this.getAngleHelper(direction)
    if (angleHelper instanceof THREE.Mesh && angleHelper.geometry instanceof THREE.CircleGeometry) {
      const { radius, segments, thetaLength } = angleHelper.geometry.parameters
      angleHelper.geometry = new THREE.CircleGeometry(radius, segments, start, thetaLength)
    } else {
      console.warn('only support THREE.CircleGeometry')
    }
  }

  private setAngleHelperLength(direction: Direction, length: number) {
    const minLength = 0.001
    const thetaLength = length >= 0 ? Math.max(length, minLength) : Math.min(length, -minLength)
    const angleHelper = this.getAngleHelper(direction)
    if (angleHelper instanceof THREE.Mesh && angleHelper.geometry instanceof THREE.CircleGeometry) {
      const { radius, thetaStart } = angleHelper.geometry.parameters
      const segments = Math.ceil(Math.abs(thetaLength) * (40 / (2 * Math.PI)))
      angleHelper.geometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength)
    } else {
      console.warn('only support THREE.CircleGeometry')
    }
  }

  private setTipsAngle(angle: number) {
    const element = this.helperObject3D.angleTips?.element
    if (!element) return
    element.innerText = `${angle.toFixed(0)}°`
  }

  private setTipsPosition(position: THREE.Vector3) {
    const angleTips = this.helperObject3D.angleTips
    if (!angleTips) return
    const project = position.project(this.camera)
    const { x, y, z } = project
    if (z > 1) return
    const left = ((x + 1) / 2) * 100 + '%'
    const top = ((-y + 1) / 2) * 100 + '%'
    angleTips.setLeftTop(left, top)
  }
}
