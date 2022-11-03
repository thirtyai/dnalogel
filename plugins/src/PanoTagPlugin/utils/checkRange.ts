export function checkRange(value?: number, range?: { min?: number; max?: number }) {
  if (value === undefined) return
  const { min, max } = range ?? {}
  if (min === undefined && max === undefined) return
  if (typeof max === 'number' && max < value) return false
  if (typeof min === 'number' && min > value) return false
  return true
}
