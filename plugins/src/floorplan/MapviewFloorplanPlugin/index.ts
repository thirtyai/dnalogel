import type { Parameters } from './typing'
import type { FivePlugin } from '@realsee/five'

import { Controller } from './Controller'

export const MapviewFloorplanPlugin: FivePlugin<undefined | Parameters, Controller> = (five, params) => {
  return new Controller(five, params)
}

export type MapviewFloorplanPluginParameterType = Parameters | undefined
export type MapviewFloorplanPluginReturnType = InstanceType<typeof Controller>
export default MapviewFloorplanPlugin
