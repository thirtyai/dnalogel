import type { FivePlugin } from '@realsee/five'
import { PanoCompassController } from './Controller'
import type { PanoCompassPluginParameterType } from './typings'

export type PanoCompassPluginExportType = PanoCompassController

export const PanoCompassPlugin: FivePlugin<
  PanoCompassPluginParameterType,
  PanoCompassPluginExportType
> = (five, config) => new PanoCompassController(five, config)

export default PanoCompassPlugin

export type { PanoCompassPluginParameterType, PanoCompassPluginData } from './typings'
