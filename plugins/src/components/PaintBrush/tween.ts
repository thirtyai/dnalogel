import { Tween, Easing } from '@tweenjs/tween.js'

export interface TweenRes extends Tween<any> {
  onDestroy: (fn: () => void) => any
  destroy: () => any
}

export default function tween(from: any, to: any, duration: number, easing = Easing.Linear.None) {
  const tweenInstance = new Tween(from).to(to, duration).easing(easing).start() as TweenRes

  function animate(time: number) {
    if (!tweenInstance.update(time)) return
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)

  return tweenInstance
}

export function tweenProgress(duration: number, easing: (amount: number) => number) {
  return tween({ progress: 0 }, { progress: 1 }, duration, easing)
}
