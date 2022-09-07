import type { Five, FivePlugin } from '@realsee/five'
import Controller from './Controller'
export * from './typing'

export const GuideLinePlugin: FivePlugin<void, InstanceType<typeof Controller>> = (five: Five) => new Controller(five)

export default GuideLinePlugin
