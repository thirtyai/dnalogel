// eslint-disable-next-line max-params
export default function doUtil<T = any>(func: () => T, util: (value: T) => boolean, duration = 20, times = 5): Promise<T> {
  return new Promise((resolve, reject) => {
    let count = 0
    const timer = setInterval(() => {
      const value = func()
      if (util(value)) {
        clearInterval(timer)
        resolve(value)
      } else if (count >= times) {
        clearInterval(timer)
        reject(value)
      }
      count++
    }, duration)
  })
}
