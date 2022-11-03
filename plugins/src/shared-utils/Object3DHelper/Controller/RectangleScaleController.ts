import { BaseController } from '../Base/BaseController'
import type { RectangleScaleHelperAbstract } from '../Helper'
import * as THREE from 'three'
import { getMouseRaycaster, vectorIsEqual } from '../utils'
import type { Direction4 } from '../typings'
import { Vector3 } from 'three'
import type { CSS3DObjectPlus } from '../../../CSS3DRenderPlugin/utils/CSS3DObjectPlus'

interface StartInfo {
  startPoint: {
    position: Vector3
    direction: Direction4
  }
  dragPointInCenterBottom?: boolean | null
  dragPointInCenterLeft?: boolean | null
  plane: THREE.Plane
}

export abstract class RectangleScaleController<
  OriginObject3D extends THREE.Object3D,
  PointType extends THREE.Object3D | HTMLElement,
> extends BaseController<RectangleScaleHelperAbstract<OriginObject3D, PointType>> {
  protected startInfo?: StartInfo

  public constructor(...params: ConstructorParameters<typeof BaseController<RectangleScaleHelperAbstract<OriginObject3D, PointType>>>) {
    super(...params)
  }

  public enable() {
    this.helperObject3D.enable()
    super.enable()
  }

  public disable() {
    this.helperObject3D.disable()
    super.disable()
  }

  public show() {
    this.helperObject3D.show()
    super.show()
  }

  public hide() {
    this.helperObject3D.hide()
    super.hide()
  }

  protected getDragPlane() {
    const plane = new THREE.Plane()
    // get normal from points
    const positions: Vector3[] = this.helperObject3D.cornerPositions
    if (positions.length === 0) return
    if (positions.length < 3) plane.setFromNormalAndCoplanarPoint(this.originObject3D.getWorldDirection(new Vector3()), positions[0]!)
    else plane.setFromCoplanarPoints(positions[0]!, positions[1]!, positions[2]!)

    return plane
  }

  protected dragStart(
    mousePoint: { x: number; y: number },
    point: {
      position: THREE.Vector3
      direction: Direction4
    },
  ) {
    this.helperObject3D.updatePoints?.()
    const plane = this.getDragPlane()

    if (!plane) return this.dragEnd()

    this.startInfo = { startPoint: { position: point.position.clone(), direction: point.direction }, plane }

    // this.scene.add(getPoint(point.position.clone(), 3))

    this.hooks.emit('scaleStart')
    this.render()
    this.isDragging = true
    console.log('%c RectangleScaleController dragStart', 'color: #e5af2e')
  }

  protected dragging(point: { x: number; y: number }): false | void {
    if (!this.isDragging) return

    const raycaster = getMouseRaycaster(this.camera, point, this.container)
    if (!raycaster) return this.dragEnd()

    this.scale(raycaster)
    console.log('%c RectangleScaleController dragging', 'color: #49de1b')
  }

  protected scale(raycaster: THREE.Raycaster) {
    if (!this.startInfo) return
    const object = this.originObject3D
    const { startPoint, plane } = this.startInfo
    const cornerPositions = this.helperObject3D.cornerPositions as [Vector3, Vector3, Vector3, Vector3]
    if (cornerPositions.length < 4) return this.dragEnd()

    const planeIntersection = raycaster.ray.intersectPlane(plane, new Vector3())
    if (!planeIntersection) return
    if (vectorIsEqual(planeIntersection, this.camera.position)) return

    const planeCenter = new Vector3().addVectors(cornerPositions[0], cornerPositions[2]).divideScalar(2)

    const { position: startPosition, direction } = startPoint

    const ewVector = new Vector3().subVectors(cornerPositions[1], cornerPositions[0]) // west -> east vector
    const nsVector = new Vector3().subVectors(cornerPositions[3], cornerPositions[0]) // south -> north vector

    // eslint-disable-next-line complexity
    const getOffset = (direction: 'ew' | 'ns') => {
      const defaultVector = new Vector3(0, 0, 0)
      if (!this.startInfo) return defaultVector
      const baseVector = (direction === 'ew' ? ewVector : nsVector).clone()

      const startPositionProject = startPosition.clone().projectOnVector(baseVector)
      const nowPositionProject = planeIntersection.clone().projectOnVector(baseVector)
      const planeCenterProject = planeCenter.clone().projectOnVector(baseVector)

      // this.scene.add(getPoint(startPosition, 0))
      // this.scene.add(getPoint(planeIntersection, 0))

      if (nowPositionProject.equals(startPositionProject)) return defaultVector

      if (direction === 'ns' && typeof this.startInfo.dragPointInCenterBottom !== 'boolean') {
        const offset = new Vector3().subVectors(nowPositionProject, planeCenterProject)
        const xIsNegative = offset.x < 0 && baseVector.x >= 0
        const yIsNegative = offset.y < 0 && baseVector.y >= 0
        const zIsNegative = offset.z < 0 && baseVector.z >= 0
        this.startInfo.dragPointInCenterBottom = xIsNegative || yIsNegative || zIsNegative
      }
      if (direction === 'ew' && typeof this.startInfo.dragPointInCenterLeft !== 'boolean') {
        const offset = new Vector3().subVectors(nowPositionProject, planeCenterProject)
        const xIsNegative = offset.x < 0 && baseVector.x >= 0
        const yIsNegative = offset.y < 0 && baseVector.y >= 0
        const zIsNegative = offset.z < 0 && baseVector.z >= 0
        this.startInfo.dragPointInCenterLeft = xIsNegative || yIsNegative || zIsNegative
      }

      const offset = new Vector3().subVectors(nowPositionProject, startPositionProject)

      // TODO: 不知道为啥b端在缩放结束有问题，先临时加个限制
      const offsetLength = offset.length()
      if (offsetLength > 0.3) {
        console.warn('offset.length() > 0.3, skipped', offsetLength)
        return defaultVector
      }

      return offset
    }

    const ewOffset = getOffset('ew')
    const nsOffset = getOffset('ns')

    const setEWScale = () => {
      const offset = ewOffset
      this.helperObject3D.cornerPositions.forEach((position, index) => {
        if (this.startInfo?.dragPointInCenterLeft) {
          if (index === 0 || index === 3) position.add(offset) // 拖左边，只改左边点
        } else {
          if (index === 1 || index === 2) position.add(offset) // 拖右边，只改右边点
        }
      })
    }

    const setNSScale = () => {
      const offset = nsOffset
      this.helperObject3D.cornerPositions.forEach((position, index) => {
        if (this.startInfo?.dragPointInCenterBottom) {
          if (index === 0 || index === 1) position.add(offset) // 拖下边，只改下边点
        } else {
          if (index === 2 || index === 3) position.add(offset) // 拖上边，只改上边点
        }
      })
    }

    switch (direction) {
      case 'ew':
        setEWScale()
        break
      case 'ns':
        setNSScale()
        break
      case 'nesw':
      case 'nwse':
        setEWScale()
        setNSScale()
    }

    // this.helperObject3D.cornerPositions.forEach((position, index) => {
    //   this.scene.add(getPoint(position, index))
    // })

    const scaleX = new Vector3().subVectors(cornerPositions[1], cornerPositions[0]).length() / ewVector.length()
    const scaleY = new Vector3().subVectors(cornerPositions[3], cornerPositions[0]).length() / nsVector.length()
    const scaleXY = new Vector3(scaleX, scaleY, 1)

    const scaleMatrix = new THREE.Matrix4().scale(scaleXY)

    // const newScale = object.scale.clone().applyMatrix4(scaleMatrix)
    // object.scale.copy(newScale) // 或者 object.scale.applyMatrix4(scaleMatrix)
    if ((object as any).isCSS3DObjectPlus) {
      ;(object as InstanceType<typeof CSS3DObjectPlus>).applyScaleMatrix4(scaleMatrix)
    } else {
      object.scale.applyMatrix4(scaleMatrix)
    }

    startPoint.position.copy(planeIntersection)

    // =================================================================================================================================================================
    // =================================================================================================================================================================
    // 移动位置
    const centerPosition = new Vector3().addVectors(cornerPositions[0], cornerPositions[2]).divideScalar(2)
    const offset = new Vector3().subVectors(centerPosition, planeCenter)
    const transformMatrix4 = new THREE.Matrix4().setPosition(offset)

    object.applyMatrix4(transformMatrix4)
    this.helperObject3D.css3DInstance?.css3DObject.applyMatrix4(transformMatrix4)
    this.helperObject3D.plane?.applyMatrix4(transformMatrix4)
    this.hooks.emit('scaleUpdate', { matrix4: scaleMatrix, helperOrigin: planeCenter })
    this.hooks.emit('positionUpdate', { matrix4: transformMatrix4 })
    // 移动位置end

    // this.helperObject3D.cornerPositions.forEach((position, index) => {
    //   this.scene.add(getPoint(position, index))
    // })

    this.render()
  }

  protected dragEnd(): void {
    if (!this.isDragging) return
    this.startInfo = undefined
    this.isDragging = false
    this.hooks.emit('scaleEnd')
    this.render()
    console.log('%c RectangleScaleController dragEnd', 'color: #e94e4e')
  }
}
