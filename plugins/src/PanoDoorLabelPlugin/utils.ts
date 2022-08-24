import type { Five } from '@realsee/five'
import { Vector3 } from 'three'

export function isTwoRectOverlaped(rect1, rect2) {
  // 两矩形的中心点水平及垂直距离
  const verticalDistance = Math.abs(rect1.top + rect1.height / 2 - rect2.top - rect2.height / 2)
  const horizontalDistance = Math.abs(rect1.left + rect1.width / 2 - rect2.left - rect2.width / 2)
  const verticalThreshold = (rect1.height + rect2.height) / 2
  const horizontalThroshold = (rect1.width + rect2.width) / 2
  if (verticalDistance > verticalThreshold && horizontalDistance > horizontalThroshold) {
    return false
  }
  return true
}

export function getCameraToward(five: Five) {
  const { camera } = five
  const cameraDirection = camera.getWorldDirection(new Vector3())
  let angel = (Math.atan(cameraDirection.z / cameraDirection.x) * 180) / Math.PI
  let toward: 'right' | 'back' | 'left' | 'forward' | '' = ''
  if (cameraDirection.x < 0) angel += 180
  if (angel < 0) angel += 360

  if (angel > 315 || angel <= 45) {
    toward = 'right'
  } else if (angel > 45 && angel <= 135) {
    toward = 'back'
  } else if (angel > 135 && angel <= 225) {
    toward = 'left'
  } else if (angel > 225 && angel <= 315) {
    toward = 'forward'
  }

  return toward
}

export function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.z - p2.z, 2) + Math.pow(p1.x - p2.x, 2))
}

// left、right、forward、back 是 roomLabel 的朝向
export function getToward(rad: number) {
  const pi_4 = Math.PI / 4
  if (rad > -pi_4 && rad <= pi_4) {
    return 'left'
  } else if (rad > pi_4 * 3 || rad <= -pi_4 * 3) {
    return 'right'
  } else if (rad > -pi_4 * 3 && rad <= -pi_4) {
    return 'forward'
  } else if (rad > pi_4 && rad <= pi_4 * 3) {
    return 'back'
  }
  return ''
}
