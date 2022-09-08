import type { Five, FivePlugin } from '@realsee/five'
import CruisePluginController from './Controller'

export { CruisePluginController }

export const CruisePlugin: FivePlugin<void, InstanceType<typeof CruisePluginController>> = (five: Five) => new CruisePluginController(five)

export type { CruisePluginExportType } from './typing'

export default CruisePlugin
