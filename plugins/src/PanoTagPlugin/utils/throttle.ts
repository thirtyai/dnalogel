/**
 * 创建一个防抖动函数，该函数在高频调用时会每隔 wait 毫秒后调用 func 方法
 * `throttle` 会在第一次调用时立刻调用一次
 * @param func - 要防抖动的函数
 * @param wait - 需要延迟的毫秒数
 */
export function throttle<T>(func: (...args: T[]) => void, wait = 200) {
  let last: NodeJS.Timeout | null
  return function (this: any, ...args: T[]) {
    if (last) return
    func.apply(this, args)
    last = setTimeout(function () {
      last = null
    }, wait)
  }
}
