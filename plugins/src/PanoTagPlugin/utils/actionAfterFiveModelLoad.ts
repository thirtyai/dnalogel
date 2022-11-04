import type { Five } from '@realsee/five'

export function actionAfterFiveModelLoad(five: Five, fuc: () => any) {
  if (five.model.loaded) fuc()
  else five.once('modelLoaded', () => fuc())
}
