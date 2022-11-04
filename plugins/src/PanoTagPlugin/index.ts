import type { Five, FivePlugin } from '@realsee/five'
import PanoTagPluginController from './controller'
export * from './controller'
export * from './typings/tag'

export type PanoTagPluginExportInterface = InstanceType<typeof PanoTagPluginController>
export type PanoTagPluginParamsInterface = ConstructorParameters<typeof PanoTagPluginController>[1]

export const PanoTagPlugin: FivePlugin<PanoTagPluginParamsInterface, PanoTagPluginExportInterface> = (five, params) =>
  new PanoTagPluginController(five, params)

export default PanoTagPlugin
