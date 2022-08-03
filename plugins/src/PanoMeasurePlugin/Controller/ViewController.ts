import type Line from '../Model/line'
import type { EventCallback } from '@realsee/five'
import Hammer from 'hammerjs'
import { Vector2 } from 'three'
import { closestPointOnLine } from '../utils/math'
import isNDCPointInScreen from '../utils/isNDCPointInScreen'
import { findAssociatedLines } from '../utils/findAssociatedLines'
import BaseController, { IControllerParams } from './BaseController'

export default class ViewController extends BaseController {
  public type = 'view'
  private highlightedLines: Line[] = []
  private hammer?: InstanceType<typeof Hammer['Manager']>

  public constructor(params: IControllerParams) {
    super(params)
    this.model.lines.forEach((line) => {
      line.distanceItem.appendTo(this.container)
      line.distanceItem.update(this.five)
      line.hook.on('selected', this.chooseLine)
      this.group.add(line.mesh)
    })
    const fiveElement = this.five.getElement()
    if (fiveElement) {
      const hammer = new Hammer(fiveElement)
      this.hammer = hammer
    }

    this.model.hook.on('lineRemoved', this.lineRemoved)
    this.five.on('cameraUpdate', this.onCameraUpdate)
    this.five.on('wantsTapGesture', this.wantsTapGesture)
    this.five.needsRender = true
  }

  public dispose() {
    super.dispose()
    this.model.hook.off('lineRemoved', this.lineRemoved)
    this.five.off('cameraUpdate', this.onCameraUpdate)
    this.five.off('wantsTapGesture', this.wantsTapGesture)
    this.five.needsRender = true
    this.hook.emit('selectedChange', [])
    this.hammer?.destroy()
  }

  public highlightLine(line: Line) {
    if (line.selected) return
    line.selected = true
    this.group.add(line.lightMesh)
    line.distanceItem.highlight()
    this.five.needsRender = true
  }

  public clearHighlightLines() {
    if (this.group.children.length === 0) return
    this.model.lines.forEach((line) => {
      line.selected = false
      line.distanceItem.unHighlight()
      this.group.remove(line.lightMesh)
    })
    this.highlightedLines = []
    this.five.needsRender = true
  }

  private wantsTapGesture: EventCallback['wantsTapGesture'] = (raycaster) => {
    // 不存在线
    if (this.model.lines.length === 0) return
    const [target] = this.five.model.intersectRaycaster(raycaster)
    // 点击射线与模型没有交点
    if (!target) return
    const camera = this.five.camera
    const ndcTarget = target.point.clone().project(camera)
    const screenWidth = this.container.clientWidth
    const screenHeight = this.container.clientHeight
    const targetScreenPosition = new Vector2(ndcTarget.x * screenWidth, ndcTarget.y * screenHeight)
    // 把线的端点全部映射到屏幕上，过滤掉不在视野内的线，同时乘以屏幕宽 & 高
    const screenLines = this.model.lines
      .map((line) => {
        const [startPoint, endPoint] = line.points
        const ndcStartPoint = startPoint.position.clone().project(camera)
        const ndcEndPoint = endPoint.position.clone().project(camera)
        if (!isNDCPointInScreen(ndcStartPoint) && !isNDCPointInScreen(ndcEndPoint)) return null
        const startScreenPosition = new Vector2(
          ndcStartPoint.x * screenWidth,
          ndcStartPoint.y * screenHeight,
        )
        const endScreenPosition = new Vector2(
          ndcEndPoint.x * screenWidth,
          ndcEndPoint.y * screenHeight,
        )
        return { id: line.id, points: [startScreenPosition, endScreenPosition] }
      })
      .filter((line) => !!line) as { id: string; points: Vector2[] }[]
    if (screenLines.length === 0) return
    // 找这些线距离鼠标点击位置最近的线
    const distanceLines = screenLines
      .map((line) => {
        const closestPoint = closestPointOnLine(targetScreenPosition, line.points)
        return { id: line.id, distance: closestPoint.distanceTo(targetScreenPosition) }
      })
      .sort((a, b) => a.distance - b.distance)
    const closestScreenLine = distanceLines[0]
    const closestLine =
      closestScreenLine.distance > 20
        ? undefined
        : this.model.lines.find(({ id }) => id === closestScreenLine.id)

    if (this.highlightedLines.length > 0 && !closestLine) {
      this.clearHighlightLines()
      return false
    }

    if (closestLine) {
      this.chooseLine(closestLine)
      return false
    }
  }

  private chooseLine = (line: Line) => {
    const highlightLines = findAssociatedLines(line)
    this.highlightLines(highlightLines)
    this.five.needsRender = true
    this.hook.emit(
      'selectedChange',
      highlightLines.map((line) => line.toCompletelyJson()),
    )
  }

  private highlightLines(lines: Line[]) {
    this.clearHighlightLines()
    this.highlightedLines = lines
    lines.forEach((line) => this.highlightLine(line))
  }

  private lineRemoved = (line: Line) => {
    this.removeLine(line)
    // TODO: 这个逻辑不太好，改进一下
    this.hook.emit(
      'selectedChange',
      this.model.lines.filter((line) => line.selected).map((line) => line.toCompletelyJson()),
    )
  }

  private onCameraUpdate = () => {
    this.updateDistanceUI()
  }
}
