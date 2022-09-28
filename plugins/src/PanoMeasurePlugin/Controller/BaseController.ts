import type Magnifier from '../Modules/Magnifier'
import type FiveHelper from '../Modules/FiveHelper'
import type { Group } from 'three'
import type { Model } from '../Model'
import type { Config } from '../typings'
import type { PanoMeasurePluginEvent } from '../typings/event.type'
import type { UserDistanceItem } from '../utils/distanceDom'
import type { Five, Intersection, IntersectMeshInterface, Subscribe } from '@realsee/five'
import type { OpenParameter } from '../typings/data'
import Line from '../Model/line'
import Point from '../Model/point'
import { preventDefault } from '../utils/ironbox'

export interface IControllerParams {
  five: Five
  group: Group
  model: Model
  config: Config
  mouseGroup: Group
  container: Element
  magnifier: Magnifier
  fiveHelper: FiveHelper
  openParams: OpenParameter
  hook: Subscribe<PanoMeasurePluginEvent>
  userDistanceItemCreator?: () => UserDistanceItem
}

export default class BaseController {
  public model: Model
  protected five: Five
  protected group: Group
  protected config: Config
  protected dashed: Line
  protected disposed = false
  protected isMobile: boolean
  protected mouseGroup: Group
  protected container: Element
  protected fiveHelper: FiveHelper
  protected hook: IControllerParams['hook']
  protected magnifier: IControllerParams['magnifier']
  protected userDistanceItemCreator: IControllerParams['userDistanceItemCreator']

  public constructor(params: IControllerParams) {
    // ==================== Params ====================
    this.five = params.five
    this.hook = params.hook
    this.model = params.model
    this.config = params.config
    this.magnifier = params.magnifier
    this.container = params.container
    this.fiveHelper = params.fiveHelper
    this.isMobile = params.openParams?.isMobile ?? false
    this.userDistanceItemCreator = params.userDistanceItemCreator
    // ==================== Groups ====================
    this.group = params.group
    this.mouseGroup = params.mouseGroup
    // ==================== 虚线 ====================
    this.dashed = new Line(new Point([0, 0, 0]), new Point([0, 0, 0]), this.model)
    this.dashed.mesh.setMaterial({ dashed: true, dashScale: 100 })
    this.dashed.mesh.name = 'dashLine'

    const fiveElement = this.five.getElement()
    if (fiveElement) {
      fiveElement.addEventListener('touchstart', preventDefault)
      fiveElement.addEventListener('contextmenu', preventDefault)
    }
  }

  public updateDistanceUI = () => {
    this.dashed.distanceItem.update(this.five)
    this.model.lines.forEach((line) => line.distanceItem.update(this.five))
  }

  protected removeLine(line: Line) {
    this.group.remove(line.mesh, line.lightMesh)
    line.distanceItem.remove()
    this.five.needsRender = true
  }

  protected updateMouseGroup(intersection: Intersection, mesh?: IntersectMeshInterface) {
    if (!intersection) return this.mouseGroup
    // ============ update mouseGroup position ============
    const adsorbentPoint = this.fiveHelper.getAdsorbentPoint(intersection)
    const viewPosition = adsorbentPoint ? adsorbentPoint : intersection.point
    this.mouseGroup.position.copy(viewPosition)
    // ============ update mouseGroup quaternion ============
    if (mesh) {
      this.mouseGroup.quaternion.copy(mesh.quaternion)
    } else if (intersection.face) {
      const normal = intersection.face.normal
      const positionVector = normal.clone().multiplyScalar(0.05)
      const position = intersection.point.clone().add(positionVector)
      const lookAtVector = position.clone().add(positionVector)
      this.mouseGroup.lookAt(lookAtVector)
    }
    return this.mouseGroup
  }

  protected dispose() {
    this.disposed = true
    this.magnifier.remove()
    this.model.lines.forEach((line) => this.removeLine(line))

    const fiveElement = this.five.getElement()
    if (fiveElement) {
      fiveElement.removeEventListener('touchstart', preventDefault)
      fiveElement.removeEventListener('contextmenu', preventDefault)
    }
  }
}
