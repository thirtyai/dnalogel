import type { Five, FivePlugin } from '@realsee/five'
import Controller from './Controller'

export const CSS3DRenderPlugin: FivePlugin<void, InstanceType<typeof Controller>> = (five: Five) => new Controller(five)

export { CSS3DRender } from './CSS3DRender'
export * from './typing'
export default CSS3DRenderPlugin
