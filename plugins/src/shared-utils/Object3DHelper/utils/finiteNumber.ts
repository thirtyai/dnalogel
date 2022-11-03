export default function finiteNumber(value: number | undefined | null | void, defaultValue = 0) {
  if (typeof value === 'undefined' || value === null) return defaultValue
  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) return defaultValue
  }
  return value
}
