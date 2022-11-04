import type { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import type { Direction4 } from '../typings'
import { RectangleScaleController } from './RectangleScaleController'
import type * as THREE from 'three'
import { getAllMesh } from '../utils/getPoint'

export class CSS3DScaleController extends RectangleScaleController<CSS3DObject, HTMLElement> {
  public constructor(...params: ConstructorParameters<typeof RectangleScaleController<CSS3DObject, HTMLElement>>) {
    super(...params)
    this.addHTMLEventListener()
  }

  private addHTMLEventListener() {
    this.helperObject3D.points.forEach((startPoint) => {
      if (!startPoint) return
      const element = startPoint.point
      const dragStart = (event: DragEvent) => this.dragStart(event, startPoint)
      const dragging = this.dragging.bind(this)
      const dragEnd = this.dragEnd.bind(this)
      element.addEventListener('dragstart', dragStart)
      element.addEventListener('drag', dragging)
      element.addEventListener('dragend', dragEnd)
    })
  }
}
