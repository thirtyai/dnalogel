import type { Five, FivePlugin } from '@realsee/five'
import Controller from './Controller'

export const GuideLinePlugin = (five: Five, config?: ConstructorParameters<typeof Controller>[1]) => new Controller(five, config)

export type { GuideLinePluginExportType } from './typing'

export default GuideLinePlugin
