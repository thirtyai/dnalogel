/**
 * 平面几何相关数学函数
 */

/**
 * 平面点坐标。
 */
export interface Point {
  x: number
  y: number
}

/**
 * 检查两个点是否位置相同
 * @param point1
 * @param point2
 * @return
 */
export function samePointAt(point1: Point, point2: Point) {
  return point1.x === point2.x && point1.y === point2.y
}

/**
 * 计算两个点之间的位置
 * @param  {point} point1
 * @param  {point} point2
 * @return {number}
 */
export function distance(point1: Point, point2: Point) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
}

/**
 * 两个计算的斜率是否相同
 * @param  {number} k1
 * @param  {number} k2
 * @return
 */
export function sameK(k1: number, k2: number) {
  if (Math.abs(k1) === Infinity && Math.abs(k2) === Infinity) return true
  return Math.abs(k1 - k2) < 0.001
}

/**
 * 获取两点之间的斜率
 * @param  {point} point1
 * @param  {point} point2
 * @return {number}
 */
export function getK(point1: Point, point2: Point) {
  return (point2.y - point1.y) / (point2.x - point1.x)
}
/**
 * 获取一点对于线段上最近的一点，
 * 如果可以是过直线垂线的垂足，不行的话取线段的两端
 * @param  {point} point1
 * @param  {linePoints} linePoints
 * @return {point}
 */
export function closestPointOnLine(point: Point, linePoints: Point[]) {
  const tA = point.x - linePoints[0].x
  const tB = point.y - linePoints[0].y
  const tC = linePoints[1].x - linePoints[0].x
  const tD = linePoints[1].y - linePoints[0].y

  const tDot = tA * tC + tB * tD
  const tLenSq = tC * tC + tD * tD
  const tParam = tDot / tLenSq

  let tXx
  let tYy

  if (tParam < 0 || samePointAt(linePoints[0], linePoints[1])) {
    tXx = linePoints[0].x
    tYy = linePoints[0].y
  } else if (tParam > 1) {
    tXx = linePoints[1].x
    tYy = linePoints[1].y
  } else {
    tXx = linePoints[0].x + tParam * tC
    tYy = linePoints[0].y + tParam * tD
  }

  return { x: tXx, y: tYy }
}

/**
 * 点到线段的距离，
 * 如果可以是过直线垂线的垂足的距离，不行的话取线段的两端的距离
 * @param  {point} point1
 * @param  {linePoints} linePoints
 * @return {number}
 */
export function pointDistanceFromLine(point: Point, linePoints: Point[]) {
  const closestPoint = closestPointOnLine(point, linePoints)
  return distance(point, closestPoint)
}

/**
 * 做线段的距离一定值的平行线段
 * @param  {number} distanceOfLine
 * @param  {linePoints} linePoints
 * @return {[linePoints, linePoints]}
 */
export function linesWithDistanceOfLine(distanceOfLine: number, linePoints: Point[]) {
  const k = getK(linePoints[1], linePoints[0])
  let dx
  let dy
  if (Math.abs(k) === Infinity) {
    dy = 0
    dx = distanceOfLine
  } else {
    dy = Math.sqrt((distanceOfLine * distanceOfLine) / (k * k + 1))
    dx = dy / -(1 / k)
  }
  const result = [
    [
      { x: linePoints[0].x - dx, y: linePoints[0].y - dy },
      { x: linePoints[1].x - dx, y: linePoints[1].y - dy },
    ],
    [
      { x: linePoints[0].x + dx, y: linePoints[0].y + dy },
      { x: linePoints[1].x + dx, y: linePoints[1].y + dy },
    ],
  ]

  if (linePoints[1].x - linePoints[0].x < 0) {
    return result
  } else if (linePoints[1].x - linePoints[0].x > 0) {
    return result.reverse()
  } else {
    if (linePoints[1].y - linePoints[0].y < 0) {
      return result.reverse()
    } else {
      return result
    }
  }
}

/**
 * 做线段的距离一定值的平行线段 (如果线段是弧形的)
 * @param  {number} distanceOfLine
 * @param  {linePoints} linePoints
 * @param  {number} 弧形定点到线段的距离
 * @return {[linePoints, linePoints]}
 */
export function linesWithDistanceOfLineWithCurve(distanceOfLine: number, linePoints: Point[], curve: number) {
  const centerPoint = getCenterPointOfPoints(linePoints)
  const pHelfDistance = distance(linePoints[0], centerPoint)
  const cDistance = Math.sqrt(curve * curve - pHelfDistance * pHelfDistance)
  const cpoint = isNaN(cDistance) ? centerPoint : linesWithDistanceOfLine(cDistance, [centerPoint, linePoints[0]])[curve > 0 ? 0 : 1][0]

  const dx1 = ((linePoints[0].x - cpoint.x) / curve) * distanceOfLine
  const dy1 = ((linePoints[0].y - cpoint.y) / curve) * distanceOfLine
  const dx2 = ((linePoints[1].x - cpoint.x) / curve) * distanceOfLine
  const dy2 = ((linePoints[1].y - cpoint.y) / curve) * distanceOfLine
  return [
    [
      { x: linePoints[0].x - dx1, y: linePoints[0].y - dy1 },
      { x: linePoints[1].x - dx2, y: linePoints[1].y - dy2 },
    ],
    [
      { x: linePoints[0].x + dx1, y: linePoints[0].y + dy1 },
      { x: linePoints[1].x + dx2, y: linePoints[1].y + dy2 },
    ],
  ]
}

/**
 * 两条线段(包括延长线)的交点点
 * @param  {linePoints} linePoints1
 * @param  {linePoints} linePoints2
 * @param   needIntersectionInLine 是否是延长线的相交
 * @return {point || false}
 */
export function intersectionOfLine(linePoints1: Point[], linePoints2: Point[], needIntersectionInLine: boolean) {
  const k1 = getK(linePoints1[1], linePoints1[0])
  const k2 = getK(linePoints2[1], linePoints2[0])

  if (isNaN(k1) || isNaN(k2)) return false
  if (sameK(k1, k2)) return false

  if (pointOnLine(linePoints1[0], linePoints2)) return linePoints1[0]
  if (pointOnLine(linePoints1[1], linePoints2)) return linePoints1[1]
  if (pointOnLine(linePoints2[0], linePoints1)) return linePoints2[0]
  if (pointOnLine(linePoints2[1], linePoints1)) return linePoints2[1]

  // needIntersectionInLine 是否焦点在线段内
  if (needIntersectionInLine && !isIntersect(linePoints1, linePoints2)) return false

  const p1 = linePoints1[0]
  const p2 = linePoints2[0]

  if (Math.abs(k1) === Infinity) {
    return { x: p1.x, y: linePoints2[1].y - (linePoints2[1].x - p1.x) * k2 }
  }
  if (Math.abs(k2) === Infinity) {
    return { x: p2.x, y: linePoints1[1].y - (linePoints1[1].x - p2.x) * k1 }
  }

  const x = (p2.y - p1.y + k1 * p1.x - k2 * p2.x) / (k1 - k2)
  const y = k1 * x - k1 * p1.x + p1.y

  return { x, y }
}

/**
 * 是否点在线段上
 * @param  {point} point
 * @param  {linePoints} linePoints
 * @return
 */
export function pointOnLine(point: Point, linePoints: Point[]) {
  if (samePointAt(point, linePoints[0])) return true
  if (samePointAt(point, linePoints[1])) return true

  return (
    true &&
    (linePoints[0].x - point.x) * (point.x - linePoints[1].x) >= 0 &&
    (linePoints[0].y - point.y) * (point.y - linePoints[1].y) >= 0 &&
    sameK(getK(linePoints[0], point), getK(point, linePoints[1]))
  )
}

/**
 * 让点按照另一个点为圆心，一定弧度的情况下转动得到下一个点
 * @param  {point} point
 * @param  {point} centerPoint
 * @param  {number} rad
 * @return {point}
 */
export function pointRotateByCenterPoint(point: Point, centerPoint: Point, rad: number) {
  const r = distance(point, centerPoint)
  let nextRad = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x)
  nextRad -= rad
  return {
    x: centerPoint.x + Math.cos(nextRad) * r,
    y: centerPoint.y + Math.sin(nextRad) * r,
  }
}

/**
 * 获取一些点的中心点
 * @param  {points} point
 * @return {point}
 */
export function getCenterPointOfPoints(points: Point[]) {
  let minX = Infinity
  let maxX = 0
  let minY = Infinity
  let maxY = 0
  points.forEach((point) => {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  })
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
}

/**
 *  判断两条线段是否相交
 */
function multi(p1: Point, p2: Point, p0: Point) {
  return (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y)
}
export function isIntersect(linePoints1: Point[], linePoints2: Point[]) {
  if (
    Math.max(linePoints1[0].x, linePoints1[1].x) >= Math.min(linePoints2[0].x, linePoints2[1].x) &&
    Math.max(linePoints2[0].x, linePoints2[1].x) >= Math.min(linePoints1[0].x, linePoints1[1].x) &&
    Math.max(linePoints1[0].y, linePoints1[1].y) >= Math.min(linePoints2[0].y, linePoints2[1].y) &&
    multi(linePoints2[0], linePoints1[1], linePoints1[0]) * multi(linePoints1[1], linePoints2[1], linePoints1[0]) > 0 &&
    multi(linePoints1[0], linePoints2[1], linePoints2[0]) * multi(linePoints2[1], linePoints1[1], linePoints2[0]) > 0
  )
    return 1
  return 0
}

/**
 * 计算点按序围成区域的面就
 * @param  {[point]} points
 * @return {number}
 */
function cross(p1: Point, p2: Point) {
  // 向量叉积
  return p1.x * p2.y - p1.y * p2.x
}

export function getAreaSize(points: Point[]) {
  let ret = 0
  return (
    (cross(
      points.reduce((pf, pn) => {
        ret += cross(pf, pn)
        return pn
      }),
      points[0],
    ) +
      ret) /
    2
  )
}

export function getAreaSizeWithoutLine(points: Point[]) {
  let ret = 0
  const r =
    (cross(
      points.reduce((pf, pn) => {
        ret += cross(pf, pn)
        return pn
      }),
      points[0],
    ) +
      ret) /
    2

  let wall = 0
  const wr =
    (distance(
      points.reduce((pf, pn) => {
        wall += distance(pf, pn) * 250
        return pn
      }),
      points[0],
    ) *
      250 +
      wall) /
    2

  return r - (wr - 250 * 1000) * (r > 0 ? 1 : -1)
}
