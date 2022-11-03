/**
 * 二分查找，查找第一个大于等于给定值的元素
 * 数组必须有序，存在重复
 * @param {array} arr 待排序数组
 * @param {number} target 目标数据
 */
export function binarySearchFirstBig(getValueByIndex: (index: number) => number, indexRange: [number, number], target: number) {
  const [min, max] = indexRange
  if (min >= max) return -1
  if (max <= 1) return -1
  // 低位下标
  let lowIndex = min
  // 高位下标
  let highIndex = max

  const cache: Record<number, number> = {}

  const getValue = (key: number) => {
    if (!cache[key]) cache[key] = getValueByIndex(key)
    return cache[key]!
  }

  while (lowIndex <= highIndex) {
    // 中间下标
    const midIndex = Math.floor((lowIndex + highIndex) / 2)
    if (getValue(midIndex) > target) {
      // 如果 midIndex 为0或者前一个数小于 target 那么找到第一个大于等于给定值的元素，直接返回
      if (midIndex === min || getValue(midIndex - 1)! <= target) return midIndex
      // 否则高位下标为中位下标减1
      highIndex = midIndex - 1
    } else {
      // 低位下标为中位下标加1
      lowIndex = midIndex + 1
    }
  }
  return -1
}

/**
 * @description: 查找第一个小于前一个数字的值
 */
export function searchFirstValueSmallThanLastValue(getValueByIndex: (index: number) => number, indexRange: [number, number]) {
  const [min, max] = indexRange
  if (min >= max) return -1
  if (max <= 1) return -1
  if (min <= 1) return -1
  const cache: Record<number, number> = {}

  const getValue = (key: number) => {
    if (!cache[key]) cache[key] = getValueByIndex(key)
    return cache[key]!
  }

  for (let index = min; index < max; index++) {
    const value = getValue(index)
    const lastValue = getValue(index - 1)
    if (value < lastValue) {
      return index
    }
  }
  return -1
}
