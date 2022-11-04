export * from '../shared-utils/Object3DHelper/typings'
export * from './Controller'
import type { Five, FivePlugin } from '@realsee/five'
import { Object3DHelperController } from './Controller'

export const Object3DHelperPlugin: FivePlugin<void, InstanceType<typeof Object3DHelperController>> = (five: Five) =>
  new Object3DHelperController(five)

export default Object3DHelperPlugin
