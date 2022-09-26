import type { UserDistanceItem } from '../utils/distanceDom'

export interface Config {
  // TODO: 这个参数传递的太恶心了，优化一下
  userDistanceItemCreator: undefined | (() => UserDistanceItem)
  /** 展示 distance DOM 时，使用的转换函数
   * @param distance 单位是 m
   */
  getDistanceText: (distance: number) => string
}