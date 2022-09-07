import type { Five, FivePlugin } from '@realsee/five'
import CruisePluginController from './Controller'

export * from './typing'
export { CruisePluginController }

const CruisePlugin: FivePlugin<void, InstanceType<typeof CruisePluginController>> = (five: Five) => new CruisePluginController(five)

export { CruisePlugin }
export default CruisePlugin
