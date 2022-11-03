import type { Object3D } from 'three'
import type { Direction } from '../typings'
import { MoveHelperAbstract } from '.'
import { ArrowGroup } from './Objects/ArrowGroup'
import { AXES_THREE_COLOR } from '../Constants/color'

export class MoveHelper extends MoveHelperAbstract {
  public xArrow = new ArrowGroup({ direction: 'x', color: AXES_THREE_COLOR.X })
  public yArrow = new ArrowGroup({ direction: 'y', color: AXES_THREE_COLOR.Y })
  public zArrow = new ArrowGroup({ direction: 'z', color: AXES_THREE_COLOR.Z })

  public constructor(originObject3D: Object3D) {
    super(originObject3D)
    this.add(this.xArrow)
    this.add(this.yArrow)
    this.add(this.zArrow)
  }

  public show() {
    super.show()
    this.xArrow.visible = true
    this.yArrow.visible = true
    this.zArrow.visible = true
  }

  public showDraggingHelper(directions: Direction[]) {
    this.xArrow.visible = directions.includes('x')
    this.yArrow.visible = directions.includes('y')
    this.zArrow.visible = directions.includes('z')
  }

  public dispose() {
    this.remove(this.xArrow, this.yArrow, this.zArrow)
  }
}
