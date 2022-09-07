// eslint-disable-next-line max-params
export default function linerValue(x0: number, v0: number, t1: number, t: number): number {
  const a = -x0 / t1
  const d = x0
  return a * t + d
}
