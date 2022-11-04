import * as THREE from 'three'
import { POINT_HELPER_TEXTURE_URL } from './Assets'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1);
  gl_Position = projectionMatrix * mvPosition;
}
`
const fragmentShader = `
varying vec2 vUv;
void main() {
  vec2 uv = vec2(vUv.x, vUv.y);
  float a = 1.0;
  float match = 1.0 - uv.x;
  gl_FragColor = vec4(1.0,1.0,1.0,match);
}
`

export interface MouseGroupParameter {
  isMobile?: boolean
  useNormalVector?: boolean // 是否展示法向量
  ballColor?: number // 法向量小球色值
}

function createPlaneMesh() {
  // 底部纹理贴图面片
  const planGeometry = new THREE.PlaneGeometry(0.3, 0.3)
  const planTextureUrl = POINT_HELPER_TEXTURE_URL
  const planTexture = new THREE.TextureLoader().load(planTextureUrl)
  planTexture.encoding = THREE.sRGBEncoding
  const planMaterial = new THREE.MeshBasicMaterial({
    map: planTexture,
    transparent: true,
    depthTest: false,
  })
  const planMesh = new THREE.Mesh(planGeometry, planMaterial)
  return planMesh
}

function createLineMesh() {
  // 法向量垂直管
  const zPath = new THREE.CurvePath<THREE.Vector3>()
  zPath.add(new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0.1)))
  const zGeometry = new THREE.TubeGeometry(zPath, 8, 0.003)
  const zMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    depthTest: false,
    transparent: true,
  })
  const zMesh = new THREE.Mesh(zGeometry, zMaterial)
  return zMesh
}

function createBallMesh() {
  // 法向量圆球
  const ballGeometry = new THREE.SphereGeometry(0.01, 20, 20)
  const ballMaterial = new THREE.MeshBasicMaterial({
    color: 0x9ded6b,
    depthTest: false,
    transparent: true,
    side: THREE.DoubleSide,
  })
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
  ballMesh.position.set(0, 0, 0.1)
  return ballMesh
}

type PlanMesh = ReturnType<typeof createPlaneMesh>
type LineMesh = ReturnType<typeof createLineMesh>
type BallMesh = ReturnType<typeof createBallMesh>

export class PointHelper extends THREE.Object3D {
  public planeMesh: PlanMesh
  public lineMesh: LineMesh
  public ballMesh: BallMesh

  public constructor() {
    super()
    this.planeMesh = createPlaneMesh()
    this.lineMesh = createLineMesh()
    this.ballMesh = createBallMesh()
    this.add(this.planeMesh, this.lineMesh, this.ballMesh)
  }

  public updateWithIntersect(intersect: THREE.Intersection) {
    if (!intersect.face) return
    const lookAtPosition = new THREE.Vector3().addVectors(intersect.point, intersect.face.normal)
    this.position.copy(intersect.point)
    this.lookAt(lookAtPosition)
  }

  public dispose() {
    this.planeMesh.material.map?.dispose()
  }
}
