/**
 * @description: 获取一个数字的最近的偶数
 * @param { number } num
 * @param { boolean } config.floor 是否取较小的偶数，默认为false，即取较大的偶数
 * @return { number } 返回一个偶数
 */
export function even(num: number, config?: { floor?: boolean }): number {
  const roundNum = Math.round(num)
  return roundNum % 2 === 0 ? roundNum : roundNum + Number(config?.floor ? -1 : 1)
}
