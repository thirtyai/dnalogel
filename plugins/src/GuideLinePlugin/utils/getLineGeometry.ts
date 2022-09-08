import * as THREE from 'three'
import getNormals from 'polyline-normals'

// 定义常量
const TRIANGLE_NUMBER_OF_RECTANGLE = 2 // 每个矩形有两个三角形
const VERTEX_NUMBER_OF_TRIANGLE = 3 // 每个三角形有三个顶点
const AXIS_NUMBER_OF_VERTEX = 3 // 每个顶点有三个轴坐标
const UV_NUMBER_OF_VERTEX = 2 // 每个顶点有两个 UV 轴坐标

export default function getLineGeometry(positionList: THREE.Vector3[]) {
  if (positionList.length < 2) return console.warn('positionList length must be greater than 1')
  const lineWidth = 0.6
  const halfLineWidth = lineWidth / 2
  const aspect = 0.67 // 纵横比 width / height
  // 点位向量数组
  const keyPoints = positionList
  // 点位组成的平滑曲线
  const curve = new THREE.CatmullRomCurve3(keyPoints, false, 'catmullrom', 0.5)

  // 求顶点和 UV
  const divisions = Math.ceil(curve.getLength()) // 曲线切片数
  const curvePoints = curve.getPoints(divisions)
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

  let totalLength = 0
  for (let i = 0; i < curvePoints.length; i++) {
    const [nx, nz] = normals[i]![0]!
    const curvePoint = curvePoints[i]
    const { x: curvePointX, y: curvePointY, z: curvePointZ } = curvePoint!
    // vertices[2i]
    positions[i * 6 + 0] = curvePointX + nx * halfLineWidth
    positions[i * 6 + 1] = curvePointY + 0.05
    positions[i * 6 + 2] = curvePointZ + nz * halfLineWidth
    // vertices[2i + 1]
    positions[i * 6 + 3] = curvePointX - nx * halfLineWidth
    positions[i * 6 + 4] = curvePointY + 0.05
    positions[i * 6 + 5] = curvePointZ - nz * halfLineWidth

    totalLength += i > 0 ? curvePoints[i - 1]!.clone().sub(curvePoints[i]!).length() : 0
    const end = totalLength / lineWidth / aspect
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
