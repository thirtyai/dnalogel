import type { Five, FivePlugin } from '@realsee/five'
import Controller from './Controller'

export const GuideLinePlugin: FivePlugin<void, InstanceType<typeof Controller>> = (five: Five) => new Controller(five)

export type { GuideLinePluginExportType } from './typing'

export default GuideLinePlugin
