import * as THREE from 'three'
import { Vector3 } from 'three'
import getNormals from 'polyline-normals'

export interface LineGeometriesConfig {
  /** 是否越过点位圆环。可以开启此选项来使越过点位，使其不会重叠显示 */
  skipPanoIndexMesh?: boolean
  unitWidth?: number
  unitHeight?: number
}

// 定义常量
const TRIANGLE_NUMBER_OF_RECTANGLE = 2 // 每个矩形有两个三角形
const VERTEX_NUMBER_OF_TRIANGLE = 3 // 每个三角形有三个顶点
const AXIS_NUMBER_OF_VERTEX = 3 // 每个顶点有三个轴坐标
const UV_NUMBER_OF_VERTEX = 2 // 每个顶点有两个 UV 轴坐标

/**
 * @description: 根据坐标获取平滑曲线
 * @param {Vector3[]} positionList 坐标点数组
 * @param {number} config.unitWidth 宽
 * @param {number} config.unitHeight 高
 * @param {boolean} config.skipPanoIndexMesh 是否越过点位圆环。可以开启此选项来使越过点位，使其不会重叠显示
 * @return {THREE.BufferGeometry[]} THREE.BufferGeometry[]
 */
export default function getLineGeometries(positionList: THREE.Vector3[], config?: LineGeometriesConfig): THREE.BufferGeometry[] {
  if (positionList.length < 2) {
    console.warn('positionList length must be greater than 1')
    return []
  }

  const unitWidth = config?.unitWidth ?? 0.5
  const unitHeight = config?.unitHeight ?? 0.5
  const skipPanoIndexMesh = config?.skipPanoIndexMesh ?? false

  // 点位组成的平滑曲线
  const curve = new THREE.CatmullRomCurve3(positionList, false, 'catmullrom', 1)

  if (skipPanoIndexMesh) {
    // 曲线切片数
    const divisions = Math.ceil((curve.getLength() / unitHeight) * 1.5) // 一个箭头切1.5点（切几个随意，越多越精准）

    const curvePoints = curve.getPoints(divisions)

    const geometries: THREE.BufferGeometry[] = []

    let startIndex = 0

    // curvePoints.forEach((point) => {
    //   const p1 = getPoint(point, 1)
    //   ;(window as any).five.scene.add(p1)
    // })

    const originPositions = positionList
    // eslint-disable-next-line complexity
    originPositions.forEach((originPosition, index) => {
      let nearestCurvePointIndex = 0
      let distance = 99999999
      // 获取离panoIndex最近的曲线点curvePoint
      curvePoints.forEach((curvePoint, curvePointIndex) => {
        const curvePointDistanceToOriginPosition = curvePoint.distanceTo(originPosition)
        if (curvePointDistanceToOriginPosition < distance) {
          nearestCurvePointIndex = curvePointIndex
          distance = curvePointDistanceToOriginPosition
        }
      })

      const nextCurvePoint = curvePoints[nearestCurvePointIndex + 1]
      const nextCurvePointDistanceToOriginPosition = nextCurvePoint?.distanceTo(originPosition)
      const lastCurvePoint = curvePoints[nearestCurvePointIndex - 1]
      const lastCurvePointDistanceToOriginPosition = lastCurvePoint?.distanceTo(originPosition)

      if (nearestCurvePointIndex > startIndex && nearestCurvePointIndex - startIndex > 1) {
        let endIndex = nearestCurvePointIndex
        // endIndex
        if (lastCurvePoint !== undefined && lastCurvePointDistanceToOriginPosition! > 0.8) {
          endIndex = nearestCurvePointIndex + 1
        }
        if (
          lastCurvePoint !== undefined &&
          lastCurvePointDistanceToOriginPosition! > 0.2 &&
          lastCurvePointDistanceToOriginPosition! < 0.3
        ) {
          endIndex = nearestCurvePointIndex
        } else if (distance! > 0.2 && distance! < 0.3) {
          endIndex = nearestCurvePointIndex + 1
        }
        // end
        // startIndex
        let _startIndex = startIndex

        if (
          nextCurvePoint !== undefined &&
          nextCurvePointDistanceToOriginPosition! > 0.2 &&
          nextCurvePointDistanceToOriginPosition! < 0.3
        ) {
          _startIndex = startIndex + 1
        } else if (distance! > 0.2 && distance! < 0.3) {
          _startIndex = startIndex
        }
        if (curvePoints[_startIndex] && curvePoints[_startIndex + 1]) {
          const pano = originPositions[index - 1]
          if (pano) {
            if (pano.equals(curvePoints[_startIndex]!)) _startIndex += 1
            else {
              const normal = new Vector3().subVectors(curvePoints[_startIndex + 1]!, curvePoints[_startIndex]!)
              const panoPosition = new Vector3().subVectors(pano!, curvePoints[_startIndex]!)
              const isBehind = normal.angleTo(panoPosition) < Math.PI / 2
              if (isBehind) _startIndex += 1
            }
          }
          // const p0 = getPoint(pano, 0)
          // const p1 = getPoint(curvePoints[_startIndex]!, 1)
          // const p2 = getPoint(curvePoints[_startIndex + 1]!, 2)
          // ;(window as any).five.scene.add(p0, p1, p2)
        }
        // end

        if (endIndex < _startIndex || endIndex - _startIndex <= 1) return
        const slicedCurvePoints = curvePoints.slice(_startIndex, endIndex)
        const geometry = getLineGeometry(slicedCurvePoints, unitWidth, unitHeight)
        geometries.push(geometry)
        startIndex = nearestCurvePointIndex
      }
    })
    return geometries
  } else {
    // 曲线切片数
    const divisions = Math.ceil(curve.getLength()) // 一米切一个点
    const curvePoints = curve.getPoints(divisions)
    const geometry = getLineGeometry(curvePoints, unitWidth, unitHeight)
    return [geometry]
  }
}

function getLineGeometry(curvePoints: Vector3[], unitWidth: number, unitHeight: number) {
  const halfUnitWidth = unitWidth / 2
  const aspect = unitHeight / unitWidth // 纵横比 height / width

  const curvePointsLength = curvePoints.length

  const normals = getNormals(curvePoints.map((p) => [p.x, p.z])) // curvePoints：每个点切线的向量「二维」

  const rectangleNumber = curvePoints.length - 1 // 曲线上 N 个点，构成了 N - 1 个矩形
  const indexNumber = rectangleNumber * TRIANGLE_NUMBER_OF_RECTANGLE * VERTEX_NUMBER_OF_TRIANGLE
  const verticesNumber = 2 * curvePointsLength // 顶点数量（包含公用）：每个曲线点对应两个顶点，N 个 点有 2N 个顶点
  const positionNumber = verticesNumber * AXIS_NUMBER_OF_VERTEX // 坐标点数量
  const uvNumber = verticesNumber * UV_NUMBER_OF_VERTEX // uv 数量

  const index = new Uint32Array(indexNumber)
  const positions = new Float32Array(positionNumber)
  const uv = new Float32Array(uvNumber)

  curvePoints.forEach((point, i) => {
    // if (i === curvePoints.length - 1) {
    //   const p1 = getPoint(point, 1)
    //   ;(window as any).five.scene.add(p1)
    // } else {
    //   // const p1 = getPoint(point, 0)
    //   // ;(window as any).five.scene.add(p1)
    // }
    if (i === 0) {
      // const p1 = getPoint(point, 3)
      // ;(window as any).five.scene.add(p1)
    } else {
      // const p1 = getPoint(point, 0)
      // ;(window as any).five.scene.add(p1)
    }
  })

  let totalLength = 0
  for (let i = 0; i < curvePoints.length; i++) {
    const [nx, nz] = normals[i]![0]!
    const curvePoint = curvePoints[i]!
    const { x: curvePointX, y: curvePointY, z: curvePointZ } = curvePoint
    // vertices[2i]
    const vertices2i = new Vector3(curvePointX + nx * halfUnitWidth, curvePointY + 0.05, curvePointZ + nz * halfUnitWidth)
    positions[i * 6 + 0] = vertices2i.x
    positions[i * 6 + 1] = vertices2i.y
    positions[i * 6 + 2] = vertices2i.z

    // vertices[2i + 1]
    const vertices2i1 = new Vector3(curvePointX - nx * halfUnitWidth, curvePointY + 0.05, curvePointZ - nz * halfUnitWidth)
    positions[i * 6 + 3] = vertices2i1.x
    positions[i * 6 + 4] = vertices2i1.y
    positions[i * 6 + 5] = vertices2i1.z

    totalLength += i > 0 ? curvePoints[i - 1]!.clone().sub(curvePoints[i]!).length() : 0
    const end = totalLength / unitWidth / aspect
    uv[i * 4 + 0] = 0
    uv[i * 4 + 1] = end
    uv[i * 4 + 2] = 1
    uv[i * 4 + 3] = end

    if (i === curvePoints.length - 1) continue
    index[i * 6 + 0] = i * 2 + 0
    index[i * 6 + 1] = i * 2 + 2
    index[i * 6 + 2] = i * 2 + 1
    index[i * 6 + 3] = i * 2 + 2
    index[i * 6 + 4] = i * 2 + 3
    index[i * 6 + 5] = i * 2 + 1
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  geometry.setIndex(new THREE.BufferAttribute(index, 1))

  return geometry
}
