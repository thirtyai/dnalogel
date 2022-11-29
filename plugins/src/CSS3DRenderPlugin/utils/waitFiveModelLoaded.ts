import type { Five } from '@realsee/five'

export default async function fiveModelLoaded(five: Five) {
  return new Promise<void>((resolve) => {
    if (five.model?.loaded) {
      resolve()
      return
    } else {
      five.once('modelLoaded', () => resolve())
    }
  })
}
