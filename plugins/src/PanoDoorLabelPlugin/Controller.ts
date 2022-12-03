import type { Five } from '@realsee/five'
import type { BaseOptions, EventMap, State } from '../base/BasePlugin'
import type { FloorplanServerData, FloorplanServerRoomItem } from '../floorplan/typings/floorplanServerData'
import { Euler, Quaternion, Raycaster, Vector3 } from 'three'
import { BasePanoPluginController } from './BaseController'
import DoorLabelItem from './DoorLabelItem.svelte'
import type { DoorLabel, DoorLabelConfig, LabelItemProp, NeverOverlapLabel } from './typings'
import { getCameraToward, getDistance, getToward, isTwoRectOverlaped } from './utils'

const defaultBaseOptions: BaseOptions = { userAction: true }

/**
 * 分间标签插件
 * @author kyleju
 */
export class PanoDoorLabelPluginController extends BasePanoPluginController<State, EventMap<State>> {
  private MinVisibledistance = 1.8
  private MaxVisibledistance = 5
  private OffsetHeight = -1.3 // 标签页面高度偏移值
  private rooms!: FloorplanServerRoomItem[]
  private floorplanServerData: FloorplanServerData
  /** 标签项 */
  private doorLabelItems: DoorLabelItem[]
  /** 每个点位 visible 标签的缓存 */
  private visibleLabelMap = new Map<number, number[]>()
  /** 标签项Prop值 */
  private labelItems: LabelItemProp[] = []
  /** 数据 */
  private doorLabels!: DoorLabel[]
  private roomObservers: {
    panoIndex: number
    floorIndex: number
    name: string
  }[]

  public constructor(five: Five) {
    super(five)
  }

  public loadData = (floorplanServerData: FloorplanServerData, doorLabelConfig?: DoorLabelConfig) => {
    if (doorLabelConfig) {
      this.MaxVisibledistance = doorLabelConfig.MaxVisibledistance
      this.MinVisibledistance = doorLabelConfig.MinVisibledistance
      this.OffsetHeight = doorLabelConfig.OffsetHeight
    }
    if (this.doorLabelItems && this.doorLabelItems.length > 0) {
      this.doorLabelItems.forEach((doorItem) => {
        doorItem.$destroy()
      })
    }
    this.labelItems = []
    this.doorLabels = []
    this.doorLabelItems = []

    this.floorplanServerData = floorplanServerData
    // this.initData()
    if (typeof this.five.ready === 'function') {
      this.five.ready().then(() => this.initData())
    } else {
      this.five.once('panoArrived', () => {
        // console.log('doorplugin', 'panoArrived')
        this.initData()
      })
    }
  }

  public stateChangedCallback(prevState: State, options?: BaseOptions) {
    if (this.hooks.hasListener('stateChange')) {
      const optionParams = {
        state: this.state,
        prevState,
        userAction: options ? options.userAction : defaultBaseOptions.userAction,
      }
      this.hooks.emit('stateChange', optionParams)
    }
  }

  public render() {
    if (!this.enabled) {
      this.doorLabelItems &&
        this.doorLabelItems.length > 0 &&
        this.doorLabelItems.forEach((item) => {
          item?.$destroy()
        })
      this.doorLabels = undefined
      return
    }
    if (this.doorLabelItems) {
      this.doorLabelItems.forEach((item) => {
        item.$destroy()
      })
    }
    this.doorLabelItems = []
    this.labelItems.forEach((item) => {
      this.doorLabelItems.push(
        new DoorLabelItem({
          target: this.container,
          props: {
            props: item,
            onClick: () => {
              this.onClick(item.name, item.position)
            },
          },
        }),
      )
    })
  }

  public initState(): State {
    return { enabled: true, visible: true }
  }

  public dispose(): void {
    if (this && this.five) {
      this.five.off('wantsToMoveToPano', this.hideAllLabels)
      this.five.off('modelLoaded', this.fixDoorVisibleAndPosition)
      this.five.off('panoArrived', this.fixDoorVisibleAndPosition)
      this.five.off('initAnimationEnded', this.fixDoorPosition)
      this.five.off('cameraUpdate', this.fixDoorPosition)
      this.five.off('mouseWheel', this.fixDoorPosition)
      this.five.off('pinchGesture', this.fixDoorPosition)
      super.dispose()
    }
  }

  private initRoomObservers = () => {
    const floorDatas = this.floorplanServerData.computed_data.floor_datas || []
    const observers = this.five?.work?.observers || []
    const roomObservers = observers
      // eslint-disable-next-line array-callback-return
      .map((ob) => {
        const panoIndex = ob.panoIndex
        const floorIndex = ob.floorIndex
        const floor = floorDatas?.find((d) => d.floor_index === floorIndex)
        if (floor) {
          const room = floor.rooms.find((r) => r.observer_indexs.includes(panoIndex))
          if (room) {
            return { panoIndex, floorIndex, name: room.name }
          }
        }
      })
      .filter(Boolean)
    this.roomObservers = roomObservers
  }

  private hideAllLabels = () => {
    this.labelItems.forEach((item) => {
      item.visible = false
      item.inSight = false
    })
    this.render()
  }

  private fixDoorVisibleAndPosition = () => {
    this.initRoomObservers()
    const { panoIndex } = this.five
    if (!this.visible) return
    if (this.five.model.empty) return
    if (panoIndex === null) return
    if (!this.roomObservers.find((item) => item.panoIndex === panoIndex)) return

    const roomObserver = this.roomObservers.find((item) => {
      return item.panoIndex === panoIndex
    })
    const position = this.five.work.observers.find((item) => item.panoIndex === panoIndex).position
    const targetPoint = position.clone()
    const visibleLabelIds = (() => {
      if (this.visibleLabelMap.has(panoIndex)) {
        /** 使用缓存 */
        return this.visibleLabelMap.get(panoIndex)!
      } else {
        const visibleDoorIds: number[] = []
        this.doorLabels.forEach((doorLabelItem, index) => {
          // step1 校验分间
          if (doorLabelItem.roomName === roomObserver.name) return
          // step2 校验最大最小值
          const doorPosition = doorLabelItem.position.clone()
          const distance = doorPosition.distanceTo(targetPoint)
          if (distance < this.MinVisibledistance || distance > this.MaxVisibledistance) return
          // step3 碰撞检测是否有遮挡
          const raycaster = new Raycaster()
          const direction = doorPosition.clone().sub(targetPoint).normalize()
          raycaster.set(targetPoint, direction)
          const [intersection] = this.five.model.intersectRaycaster(raycaster)
          if (intersection && intersection.distance + 0.1 < distance) return
          // 🥳 最终剩下的就是当前点位可见的标签
          visibleDoorIds.push(index)
        })
        this.visibleLabelMap.set(panoIndex, visibleDoorIds)
        return visibleDoorIds
      }
    })()
    this.labelItems.forEach((data, index) => {
      data.visible = visibleLabelIds.includes(index)
    })
    this.fixDoorPosition()
  }

  private fixDoorPosition = () => {
    const { panoIndex, camera } = this.five
    if (panoIndex === null) return
    if (this.five.currentMode !== 'Panorama') return this.hideAllLabels()

    const fiveElement = this.five.getElement()
    const canvasWidth = fiveElement!.clientWidth
    const canvasHeight = fiveElement!.clientHeight
    const cameraDirection = camera.getWorldDirection(new Vector3())
    const neverOverlapLabels: NeverOverlapLabel[] = []
    const labelItems: LabelItemProp[] = [...this.labelItems]

    labelItems.forEach((doorLabel, index) => {
      if (doorLabel.visible) {
        const disFromCameraToLabel = camera.position.distanceTo(doorLabel.position)
        const labelPosition = doorLabel.position.clone().add(new Vector3(0, this.OffsetHeight, 0))
        const direction = labelPosition.clone().sub(camera.position).normalize()
        const angle = direction.angleTo(cameraDirection)
        const mouse = labelPosition.clone().project(camera)
        const left = ((mouse.x + 1) / 2.2) * 100
        const top = ((-mouse.y + 1) / 2.2) * 100
        const visible =
          left >= 0 &&
          left <= 100 &&
          top >= 0 &&
          top <= 100 &&
          disFromCameraToLabel > this.MinVisibledistance &&
          disFromCameraToLabel <= this.MaxVisibledistance
        doorLabel.left = left
        doorLabel.top = top
        doorLabel.inSight = visible && angle < Math.PI / 2
        doorLabel.cameraToward = getCameraToward(this.five)
        if (visible) neverOverlapLabels.push({ disFromCameraToLabel, left, top, index })
        else doorLabel.transform = 'translate(-50%, -50%)'
      } else {
        doorLabel.inSight = false
      }
    })

    // 视线内多标签防重叠单独处理
    if (neverOverlapLabels.length > 1) {
      let heightLevel = 0
      neverOverlapLabels.sort((a, b) => b.disFromCameraToLabel - a.disFromCameraToLabel)

      for (let i = 1; i < neverOverlapLabels.length; i++) {
        const { index: idx1, left: l1, top: t1 } = neverOverlapLabels[i - 1]
        const { index: idx2, left: l2, top: t2 } = neverOverlapLabels[i]
        const rectDom1 = this.container.children[idx1]
        const rectDom2 = this.container.children[idx2]
        if (!rectDom1 || !rectDom2) return

        const rect1 = {
          left: (canvasWidth * l1) / 100,
          top: (canvasHeight * t1) / 100,
          width: rectDom1.children?.[0]?.clientWidth ?? 0,
          height: rectDom1.children?.[0]?.clientHeight ?? 0,
        }
        const rect2 = {
          left: (canvasWidth * l2) / 100,
          top: (canvasHeight * t2) / 100,
          width: rectDom2.children?.[0]?.clientWidth ?? 0,
          height: rectDom2.children?.[0]?.clientHeight ?? 0,
        }
        if (isTwoRectOverlaped(rect1, rect2)) {
          heightLevel++
          labelItems[idx1].transform = `translate(-50%, ${(heightLevel - 1) * 100 - 50}%)`
          labelItems[idx2].transform = `translate(-50%, ${heightLevel * 100 - 50}%)`
        }
      }
    }

    this.labelItems = labelItems
    this.render()
  }

  private onClick = (roomName: string, position: Vector3) => {
    if (!this.roomObservers) return
    const { work } = this.five

    let nearestIndex
    let nearestVector
    let minDistance = Infinity
    for (const observer of work.observers) {
      const roomObserver = this.roomObservers.find((ro) => ro.panoIndex === observer.panoIndex && ro.name === roomName)
      if (roomObserver) {
        const observerPoint = observer.standingPosition
        const distance = position.distanceTo(observerPoint)
        if (distance < minDistance) {
          nearestIndex = observer.panoIndex
          nearestVector = observerPoint.clone().sub(position).normalize()
          minDistance = distance
        }
      }
    }

    if (nearestVector !== null && nearestIndex !== null) {
      const options: Record<string, any> = {}
      if (minDistance > 0) {
        const fromVector = new Vector3(0, 0, -1)
        const toVector = nearestVector.clone()
        const quaternion = new Quaternion()
        quaternion.setFromUnitVectors(fromVector, toVector)
        const euler = new Euler()
        euler.setFromQuaternion(quaternion, 'YXZ')
        options.longitude = euler.y
      }
      const canceled = this.five.emit('wantsToMoveToPano', nearestIndex, {}, true)
      if (!canceled) {
        this.five.moveToPano(nearestIndex, { longitude: options.longitude })
      }
    }
  }

  private initData = () => {
    this.doorLabels = []
    const pano_index = this.five.panoIndex
    const floor_index = this.floorplanServerData.computed_data.observers[pano_index].floor_index
    const rooms = floor_index !== undefined && this.floorplanServerData.computed_data.floor_datas[floor_index]?.rooms
    this.rooms = rooms
    if (this.rooms && this.rooms.length > 0) {
      this.rooms.forEach((room) => {
        const doors = this.floorplanServerData.computed_data.doors?.filter((doorItem) => {
          if (doorItem && doorItem.name === room.name) {
            return true
          }
          return false
        })

        const observersInRoom = this.five.work.observers.filter((observer, index) => {
          if (room.observer_indexs.find((item) => item === index)) return true
          return false
        })
        if (doors) {
          doors.forEach((door) => {
            const doorPoint = door.position
            let minDistance = Infinity
            let nearestPoint: { x: number; y: number; z: number } | undefined

            // 遍历门所在房间所有的点，找到离门最近的点
            observersInRoom.forEach((observer) => {
              const position = observer.standingPosition
              const observerPoint = {
                x: position.x,
                y: position.y,
                z: position.z,
              }
              const distance = getDistance(doorPoint, observerPoint)
              if (distance < minDistance) {
                minDistance = distance
                nearestPoint = observerPoint
              }
            })
            if (nearestPoint) doorPoint.y = nearestPoint.y + 0.01
            const position = new Vector3(doorPoint.x, doorPoint.y, doorPoint.z)
            position.add(new Vector3(-0.2, 1.8, 0).applyEuler(new Euler(0, door.rad, 0)))
            this.doorLabels.push({
              roomName: room.name,
              name: door.name,
              position,
              toward: getToward(door.rad),
            })
          })
        }
      })
    }

    this.labelItems = this.doorLabels.map((data) => ({
      ...data,
      left: 0,
      top: 0,
      visible: false,
      inSight: false,
      transform: '',
      cameraToward: '',
    }))

    // console.log('doorplugin', 'labelItems', this.labelItems)

    this.five.on('wantsToMoveToPano', this.hideAllLabels)
    this.five.on('modelLoaded', this.fixDoorVisibleAndPosition)
    this.five.on('panoArrived', this.fixDoorVisibleAndPosition)
    this.five.on('initAnimationEnded', this.fixDoorPosition)
    this.five.on('cameraUpdate', this.fixDoorPosition)
    this.five.on('mouseWheel', this.fixDoorPosition)
    this.five.on('pinchGesture', this.fixDoorPosition)

    this.fixDoorVisibleAndPosition()
  }
}
