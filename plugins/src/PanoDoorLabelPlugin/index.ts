import type { Five, FivePlugin } from '@realsee/five'
import type { FloorplanServerData } from '../floorplan'
import type { PanoDoorLabelPluginController } from './Controller'
import * as Controller from './Controller'

export type {
  FloorplanServerData,
  FloorplanServerRoomItem,
} from '../floorplan/typings/floorplanServerData'

const PanoDoorLabelPlugin: FivePlugin<FloorplanServerData, PanoDoorLabelPluginController> = (
  five: Five,
) => {
  return new Controller.PanoDoorLabelPluginController(five)
}
export { PanoDoorLabelPlugin }

export default PanoDoorLabelPlugin
